export function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(`nauchdvizh:${key}`)) ?? fallback; }
  catch { return fallback; }
}
export function writeLocal(key, value) {
  try { localStorage.setItem(`nauchdvizh:${key}`, JSON.stringify(value)); return true; }
  catch { return false; }
}
