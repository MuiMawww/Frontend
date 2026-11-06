import test from 'node:test';
import assert from 'node:assert/strict';
import { validateResumeFile, MAX_RESUME_BYTES } from '../src/services/resume-file-store.js';

test('Импорт принимает PDF, DOCX и TXT до 10 МБ', () => {
  for (const name of ['резюме.pdf', 'resume.DOCX', 'resume.txt']) {
    assert.doesNotThrow(() => validateResumeFile({ name, size: MAX_RESUME_BYTES }));
  }
});
test('Импорт отклоняет пустые, слишком большие и неподдерживаемые файлы', () => {
  for (const file of [null, { name: 'resume.txt', size: 0 }, { name: 'resume.pdf', size: MAX_RESUME_BYTES + 1 }, { name: 'resume.pdf.exe', size: 100 }]) {
    assert.throws(() => validateResumeFile(file));
  }
});
