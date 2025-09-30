from pydantic import BaseModel
from typing import Optional
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    DONE = "DONE"
    ERROR = "ERROR"

class TranscriptionBase(BaseModel):
    filename: str
    status: JobStatus
    language: Optional[str] = None
    duration_sec: Optional[float] = None
    text: Optional[str] = None

class TranscriptionCreate(BaseModel):
    pass  # 업로드 시 파일로 처리하므로 바디 스키마 없음

class TranscriptionOut(TranscriptionBase):
    id: int
