import os
from faster_whisper import WhisperModel
from dotenv import load_dotenv

load_dotenv()
_MODEL_NAME = os.getenv("WHISPER_MODEL", "base")

# 모델은 프로세스당 1회 로드 (비동기 안전하게 전역 싱글톤)
# GPU가 있다면 compute_type="float16", device="cuda"로 변경 가능
model = WhisperModel(_MODEL_NAME, device="cpu", compute_type="int8")

def transcribe_audio(file_path: str):
    # beam_size 1 => 빠름, 숫자 올리면 정확도↑ 속도↓
    segments, info = model.transcribe(file_path, beam_size=1, vad_filter=True)
    text_parts = []
    for seg in segments:
        text_parts.append(seg.text)
    full_text = "".join(text_parts).strip()
    return {
        "text": full_text,
        "language": info.language,
        "duration": info.duration
    }
