// src/components/Layout.jsx

// 카드 폭과 간격을 기준으로 좌우 데코의 위치를 계산
// cardStyle.maxWidth = 960 이므로 반폭 480 + 여백 80 = 560
const OFFSET_FROM_CENTER = 560;

export const outerStyle = {
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '56px 16px',
  background:
    'radial-gradient(900px 420px at 0% -10%, #eef2ff 0%, transparent 60%),\
     radial-gradient(900px 420px at 100% 0%, #e6f7ff 0%, transparent 60%),\
     linear-gradient(120deg, #f7f9ff, #eaf1ff)',
  overflow: 'hidden',
};

export const cardStyle = {
  width: '100%',
  maxWidth: 960,
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #edf2f7',
  boxShadow: '0 12px 28px rgba(16,24,40,.08)',
  padding: 28,
  position: 'relative',
  zIndex: 2,
  margin: 'auto',
};

// 공통: 네모(둥근 모서리), 화면 세로 중앙 정렬
export const decoBase = {
  position: 'absolute',
  width: 480,           // 💡 필요하면 240~320으로 조절
  height: 480,
  borderRadius: 20,     // 네모 통일 (살짝 둥글게)
  objectFit: 'cover',
  boxShadow: '0 12px 30px rgba(0,0,0,.12)',
  opacity: 0.9,
  userSelect: 'none',
  pointerEvents: 'none',
  zIndex: 1,

  // 세로 중앙
  top: '50%',
  transform: 'translateY(-50%)',
};

// 오른쪽 데코: 화면 중앙에서 +OFFSET 만큼 오른쪽
export const decoRight = {
  ...decoBase,
  left: `calc(50% + ${OFFSET_FROM_CENTER}px)`,
};

// 왼쪽 데코: 화면 중앙에서 +OFFSET 만큼 왼쪽
export const decoLeft = {
  ...decoBase,
  right: `calc(50% + ${OFFSET_FROM_CENTER}px)`,
};

// (선택) 작은 화면에서는 숨기고 싶다면 아래를 참고해서 CSS 미디어쿼리로 처리해도 됩니다.
// 여기서는 JS로 처리하지 않고 App.jsx에서 이미지 자체를 그려놓되 CSS에 숨김 클래스를 주는 방식을 권장.
