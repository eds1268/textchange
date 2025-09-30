import { useState } from 'react';
import UploadForm from './components/UploadForm';
import TranscriptionList from './components/TranscriptionList';
import { outerStyle, cardStyle, decoLeft, decoRight } from './components/Layout';

export default function App() {
  const [items, setItems] = useState([]);

  // ⬇️ 새로고침/업로드마다 바뀌도록 시드 상태로 관리
  const [seedBase, setSeedBase] = useState(() => Date.now());

  // 좌/우 서로 다른 시드 (캐시 방지용 ts 쿼리도 추가)
  const leftSrc  = `https://picsum.photos/seed/${seedBase}-L/800/800?ts=${seedBase}`;
  const rightSrc = `https://picsum.photos/seed/${seedBase}-R/800/800?ts=${seedBase}`;

  // 업로드 완료 시: 리스트 갱신 + 이미지 시드 갱신
  const handleUploaded = (newItem) => {
    setItems([newItem]);
    setSeedBase(Date.now());  // ⬅️ 이 줄이 이미지 교체 핵심
  };

  return (
    <div style={outerStyle}>
      {/* 데코 이미지: 좌/우 서로 다른 이미지 */}
      <img src={leftSrc}  alt="" aria-hidden="true" loading="lazy" style={decoLeft}  />
      <img src={rightSrc} alt="" aria-hidden="true" loading="lazy" style={decoRight} />

      <div style={cardStyle}>
        <header style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0 }}>
            🎙️ 오디오 파일을 텍스트로 변환 합니다.
          </h1>
          <p style={{ marginTop: 8, opacity: 0.7 }}>
            필요하신 오디오 파일을 아래 「파일 선택」란에 넣고 업로드 & 전송 해주세요.
          </p>
        </header>

        {/* 업로드 완료 시 이미지도 새로고침 */}
        <UploadForm onUploaded={handleUploaded} />

        <TranscriptionList items={items} />
      </div>
    </div>
  );
}
