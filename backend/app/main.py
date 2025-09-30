import os
import re
import shutil
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, insert, update
from sqlalchemy.ext.asyncio import AsyncSession

from .database import Base, engine, get_db
from .models import Transcription, JobStatus
from .schemas import TranscriptionOut
from .asr import transcribe_audio

app = FastAPI(title="Speech2Text API")

# CORS (프록시를 쓰면 없어도 되지만 둘 다 켜두면 편함)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def format_text(t: str | None) -> str | None:
    """
    전사 결과를 가독성 좋게 줄바꿈 처리:
    - 과도한 공백을 하나로 정리
    - 문장부호(., ?, !) 뒤의 공백을 줄바꿈으로 치환
    """
    if not t:
        return t
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"(?<=[\.?!])\s+", "\n", t)
    return t


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/api/transcriptions", response_model=List[TranscriptionOut])
async def list_transcriptions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transcription).order_by(Transcription.id.desc()).limit(50)
    )
    rows = result.scalars().all()
    return [
        TranscriptionOut(
            id=r.id,
            filename=r.filename,
            status=r.status.value,
            language=r.language,
            duration_sec=r.duration_sec,
            text=r.text,
        )
        for r in rows
    ]


@app.get("/api/transcriptions/{tid}", response_model=TranscriptionOut)
async def get_transcription(tid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transcription).where(Transcription.id == tid)
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return TranscriptionOut(
        id=r.id,
        filename=r.filename,
        status=r.status.value,
        language=r.language,
        duration_sec=r.duration_sec,
        text=r.text,
    )


@app.post("/api/upload", response_model=TranscriptionOut)
async def upload_audio(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    # 1) DB에 PENDING 생성
    stmt = insert(Transcription).values(
        filename=file.filename, status=JobStatus.PENDING
    )
    res = await db.execute(stmt)
    await db.commit()
    tid = res.inserted_primary_key[0]

    # 2) 파일 저장
    save_path = os.path.join(UPLOAD_DIR, f"{tid}_{file.filename}")
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # 3) PROCESSING 업데이트
    await db.execute(
        update(Transcription)
        .where(Transcription.id == tid)
        .values(status=JobStatus.PROCESSING)
    )
    await db.commit()

    # 4) 전사 실행 (동기 처리)
    try:
        result = transcribe_audio(save_path)
        formatted_text = format_text(result.get("text"))

        await db.execute(
            update(Transcription)
            .where(Transcription.id == tid)
            .values(
                status=JobStatus.DONE,
                language=result.get("language"),
                duration_sec=result.get("duration"),
                text=formatted_text,  # ✅ 줄바꿈 적용된 텍스트 저장
            )
        )
        await db.commit()
    except Exception as e:
        await db.execute(
            update(Transcription)
            .where(Transcription.id == tid)
            .values(status=JobStatus.ERROR, text=str(e))
        )
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    # 5) 결과 리턴
    result = await db.execute(
        select(Transcription).where(Transcription.id == tid)
    )
    r = result.scalar_one()
    return TranscriptionOut(
        id=r.id,
        filename=r.filename,
        status=r.status.value,
        language=r.language,
        duration_sec=r.duration_sec,
        text=r.text,
    )

# --- (선택) 기존 데이터 일괄 포맷용 임시 엔드포인트 ---
# 필요할 때만 잠깐 켰다가 지우세요.
# @app.post("/api/admin/format-all")
# async def format_all(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Transcription))
#     rows = result.scalars().all()
#     for r in rows:
#         r.text = format_text(r.text)
#     await db.commit()
#     return {"updated": len(rows)}
