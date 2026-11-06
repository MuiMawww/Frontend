import { loadResumeFile, saveResumeFile, validateResumeFile } from '../services/resume-file-store.js';
import { escapeHtml as esc } from '../shared/html.js';
import { requestMessage } from '../services/request-error.js';
export function createProfileController({ repository, getProfile, saved, openModal, modal, notify, fitResumeHeight }) {
  let saving = false;

  async function syncResumeFile() {
    const profile = getProfile(), panel = document.querySelector('.resume');
    if (!profile || !panel) return;
    try {
      const file = await loadResumeFile(profile.id);
      if (!panel.isConnected || getProfile()?.id !== profile.id) return;
      panel.querySelector('.resume-file-original').hidden = !file;
      panel.querySelector('.resume-file-status').textContent = file
        ? file.name + ' · ' + Math.max(1, Math.round(file.size / 1024)) + ' КБ. Сохранено в этом браузере.'
        : 'PDF, DOCX или TXT · до 10 МБ. Файл хранится в этом браузере.';
      fitResumeHeight();
    } catch { panel.querySelector('.resume-file-status').textContent = 'Хранилище файлов браузера недоступно.'; }
  }
  function importResume() {
    const profile = getProfile();
    if (!profile) return;
    openModal('Импортировать резюме', '<form class="resume-import-form"><label>Файл резюме<input type="file" name="resume-file" accept=".pdf,.docx,.txt" required></label><p>PDF, DOCX или TXT, не больше 10 МБ. Исходный документ сохранится в этом браузере. Его содержимое не заменяет поля профиля.</p><button class="primary" type="submit">Импортировать</button><p role="alert"></p></form>');
    const form = modal.querySelector('form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const button = form.querySelector('[type=submit]'), error = form.querySelector('[role=alert]');
      if (button.disabled) return;
      error.textContent = '';
      try {
        const file = form.elements.namedItem('resume-file').files[0];
        validateResumeFile(file);
        if (getProfile()?.id !== profile.id) throw new Error('Аккаунт изменился. Откройте импорт заново.');
        button.disabled = true; button.textContent = 'Импорт…';
        await saveResumeFile(profile.id, file);
        if (modal.contains(form) && modal.open) modal.close();
        await syncResumeFile();
        notify('Резюме сохранено в этом браузере');
      } catch (reason) {
        error.textContent = reason.message || 'Не удалось сохранить файл. Попробуйте ещё раз.';
      } finally { button.disabled = false; button.textContent = 'Импортировать'; }
    });
  }
  async function downloadOriginalResume() {
    const profile = getProfile();
    if (!profile) return;
    try {
      const file = await loadResumeFile(profile.id);
      if (getProfile()?.id !== profile.id) return;
      if (!file) { notify('Сначала импортируйте резюме'); return; }
      const url = URL.createObjectURL(file), link = document.createElement('a');
      link.href = url; link.download = file.name; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { notify('Не удалось открыть файл резюме'); }
  }

  function editProfile(resume = false) {
    const profile = getProfile();
    if (!profile) return;
    const fields = resume ? [['bio', 'О себе'], ['education', 'Образование'], ['specialty', 'Направление подготовки'], ['job', 'Текущая должность'], ['interests', 'Интересы через запятую']] : [['name', 'ФИО'], ['degree', 'Уровень образования'], ['email', 'Электронная почта'], ['phone', 'Телефон'], ['telegram', 'Telegram'], ['age', 'Возраст'], ['city', 'Город']];
    openModal(resume ? 'Редактировать резюме' : 'Редактировать профиль', `<form id="profile-form" class="form-grid">${fields.map(([name, label]) => `<label>${label}${name === 'bio' ? `<textarea name="${name}" maxlength="2000" rows="5">${esc(profile[name])}</textarea>` : `<input name="${name}" value="${esc(profile[name])}" type="${name === 'email' ? 'email' : name === 'age' ? 'number' : 'text'}" ${['name', 'email', 'age'].includes(name) ? 'required' : ''} ${name === 'age' ? 'min="1" max="120"' : 'maxlength="200"'}>`}</label>`).join('')}<button class="primary" type="submit">Сохранить</button></form>`);
  }

  function exportResume() {
    const profile = getProfile();
    if (!profile) return;
    const content = [profile.name, profile.degree, '', profile.bio, '', 'Образование', profile.education, profile.specialty, '', 'Текущая должность', profile.job, '', 'Интересы', profile.interests, '', 'Контакты', profile.email, profile.phone, profile.telegram, profile.city].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Резюме — ' + profile.name + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

  }
  async function save(form, values) {
    if (saving) return;
    saving = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Сохранение…';
    form.setAttribute('aria-busy', 'true');
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    let errorBox = form.querySelector('[role="alert"]');
    if (!errorBox) {
      errorBox = document.createElement('p');
      errorBox.setAttribute('role', 'alert');
      form.append(errorBox);
    }
    errorBox.textContent = '';
    try {
      const changes = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
      const profile = await repository.updateProfile(changes);
      if (modal.contains(form) && modal.open) modal.close();
      saved(profile);
      notify('Изменения сохранены');
    } catch (error) {
      const messages = [];
      for (const [name, message] of Object.entries(error.fields || {})) {
        const input = form.elements.namedItem(name);
        if (input) {
          input.setAttribute('aria-invalid', 'true');
          messages.push(String(message));
        }
      }
      errorBox.textContent = [requestMessage(error), ...messages].join(' ');
      if (!form.isConnected || !modal.open) notify(requestMessage(error));
    } finally {
      saving = false;
      submit.disabled = false;
      submit.textContent = 'Сохранить';
      form.setAttribute('aria-busy', 'false');
    }
  }
  function handleClick(button) {
    switch (button.dataset.action) {
      case 'import-resume':
        importResume();
        return true;
      case 'download-original-resume':
        downloadOriginalResume();
        return true;
      case 'edit-profile':
        editProfile();
        return true;
      case 'edit-resume':
        editProfile(true);
        return true;
      case 'resume': {
        const panel = button.closest('.resume');
        panel.classList.add('expanded');
        button.hidden = true;
        button.setAttribute('aria-expanded', 'true');
        panel.querySelector('.resume-actions').hidden = false;
        fitResumeHeight();
        return true;
      }
      case 'collapse-resume': {
        const panel = button.closest('.resume');
        panel.classList.remove('expanded');
        panel.querySelector('.resume-actions').hidden = true;
        const more = panel.querySelector('[data-action="resume"]');
        more.hidden = false;
        more.setAttribute('aria-expanded', 'false');
        fitResumeHeight();
        more.focus({ preventScroll: true });
        more.scrollIntoView({ block: "nearest" });
        return true;
      }
      case 'download-resume':
        exportResume();
        return true;

      default: return false;
    }
  }
  return { handleClick, save, syncResumeFile };

}
