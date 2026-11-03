export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export const asset = name => `/assets/${name}`;
export const tag = (text, cls='') => `<span class="tag ${cls}">${escapeHtml(text)}</span>`;
