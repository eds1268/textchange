import { useRef, useState } from 'react';
import { uploadAudio } from '../api';

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      // ✅ 서버가 “방금 생성된 1건”을 객체 형태로 반환한다고 가정
      //   (예: { id, filename, text, ... })
      const data = await uploadAudio(file);

      // 혹시 배열로 오면 첫 번째 원소로 정규화
      const item = Array.isArray(data) ? data[0] : data;

      onUploaded?.(item);  // 부모(App)에게 단일 아이템 전달

      // 파일 인풋/상태 초기화
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16 }}>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button disabled={!file || busy}>{busy ? '업로드 중...' : '업로드 & 전송'}</button>
      {error && <span style={{ color:'crimson' }}>{error}</span>}
    </form>
  );
}
