const API_BASE = '/api';

export async function uploadAudio(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listTranscriptions() {
  const res = await fetch(`${API_BASE}/transcriptions`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTranscription(id) {
  const res = await fetch(`${API_BASE}/transcriptions/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
