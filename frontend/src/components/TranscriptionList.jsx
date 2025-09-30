// 더 이상 서버에서 목록을 가져오지 않음.
// 부모(App)로부터 받은 items만 렌더링.
export default function TranscriptionList({ items = [] }) {
  if (!items.length) return <div>아직 전송 내역이 없습니다.</div>;

  // 파일명 안전화 (경로 제거 + 윈도우에서 금지문자 치환)
  const safeBaseName = (name = '') => {
    const base = name.replace(/^.*[\\/]/, '');
    return base.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  };

  // "다른 이름으로 저장" 기능
  const saveAsTxt = async (it) => {
    const text = it.text ?? '';
    const BOM = '\uFEFF'; // Windows 메모장 한글 깨짐 방지
    const blob = new Blob([BOM + text], { type: 'text/plain;charset=utf-8' });

    const base = safeBaseName(it.filename || `transcription`);
    const suggested = base.endsWith('.txt') ? base : `${base}.txt`;

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: suggested,
          types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return;
      }
    }

    const inputName = prompt('저장할 파일명을 입력하세요', suggested);
    if (!inputName) return;
    const finalName = safeBaseName(inputName);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // 인라인 스타일 (원하면 CSS 파일로 분리 가능)
  const styles = {
    card: { border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#fff' },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
    },
    left: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
    fileName: {
      fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    },
    badge: {
      fontSize: 12, color: '#16803c',
      background: '#E6F4EA', border: '1px solid #CDE9D6',
      borderRadius: 12, padding: '2px 8px', lineHeight: 1.8
    }
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map(it => (
        <div key={it.id ?? it.filename} style={styles.card}>
          {/* 상단: 파일명 + 변환 완료(왼쪽), 다른 이름으로 저장(오른쪽) */}
          <div style={styles.header}>
            <div style={styles.left}>
              <div style={styles.fileName} title={it.filename}>{it.filename}</div>
              <span style={styles.badge}>변환 완료!</span>
            </div>
            <button
              onClick={() => saveAsTxt(it)}
              disabled={!it.text || it.text.trim().length === 0}
              title="전사 텍스트를 .txt로 저장"
            >
              다른 이름으로 저장
            </button>
          </div>

          {/* 필요 시 추가 메타 표시 */}
          {/* <div style={{ fontSize:12, opacity:.7, marginTop:4 }}>
            #{it.id ?? '?'} • {it.status ?? 'DONE'} • {it.language ?? 'lang?'} • {it.duration_sec ? `${it.duration_sec.toFixed(1)}s` : '-'}
          </div> */}

          {/* 본문 전사 결과 */}
          <pre
          style={{
          whiteSpace: 'pre-wrap',
          marginTop: 8,
          maxHeight: '48vh',       // 화면 높이의 절반 정도까지만 늘리고
          overflowY: 'auto',       // 내부 스크롤
          background: '#f7fafc',   // 부드러운 배경
          border: '1px solid #edf2f7',
          borderRadius: 8,
          padding: 12,
          lineHeight: 1.5,
          wordBreak: 'break-word',
      }}
>
  {it.text || (it.status === 'ERROR' ? '에러 발생' : '전송 결과 대기/처리 중...')}
</pre>
        </div>
      ))}
    </div>
  );
}
