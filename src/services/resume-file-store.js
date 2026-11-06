
// Original files stay on this device until a backend upload contract is connected.
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export function validateResumeFile(file) {
  if (!file || !/\.(pdf|docx|txt)$/i.test(file.name)) throw new Error('Выберите файл PDF, DOCX или TXT.');
  if (!file.size) throw new Error('Файл пуст. Выберите другой документ.');
  if (file.size > MAX_RESUME_BYTES) throw new Error('Размер файла должен быть не больше 10 МБ.');
}
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nauchdvizh-resume-files', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('resumes');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function access(profileId, mode, file) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('resumes', mode);
      const store = transaction.objectStore('resumes');
      const request = mode === 'readwrite' ? store.put(file, profileId) : store.get(profileId);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Сохранение прервано'));
    });
  } finally { db.close(); }
}
export function loadResumeFile(profileId) { return access(profileId, 'readonly'); }
export function saveResumeFile(profileId, file) { validateResumeFile(file); return access(profileId, 'readwrite', file); }
