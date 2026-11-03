import { createRepository } from './services/frontend-repository.js';
import { escapeHtml as esc } from './shared/html.js';
import { routes, header, footer, development } from './views/site-layout.js';
import { search, catalog, favoritesPage, listMarkup } from './views/conference-catalog.js';
import { profilePage } from './views/profile-page.js';
import { conferenceDetail } from './views/conference-detail-dialog.js';
import { fitResumeHeight } from './ui/responsive-layout.js';
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const repository = createRepository(document.querySelector('meta[name="api-base"]').content);
app.textContent = 'Загрузка…';
let snapshot;
try {
  snapshot = await repository.load();
}
catch {
  app.innerHTML = '<main class="empty"><h1>Не удалось загрузить данные</h1><p>Проверьте подключение и повторите загрузку.</p><button>Повторить</button></main>';
  app.querySelector('button').onclick = () => location.reload();
}
if (snapshot)
  start(snapshot);
function start({ conferences, profile, favorites }) {
  let savingFavorite = false;
  let savingProfile = false;
  let filters = {};
  let page = 1;
  let pageStart = 1;
  let profileTab = 'upcoming';
  let previousFocus;
  let toastTimer;
  const route = () => location.hash.slice(1).split('?')[0] || 'home';
  function catalogState() { return { conferences, filters, favorites, page, pageStart, home: route() === 'home' }; }
  function participating() { return conferences.filter(c => profile.participatingIds?.includes(c.id)); }
  function render() {
    const current = route();
    const pages = {
      home: ['твоя научная среда', () => catalog(catalogState())],
      conferences: ['Конференции', () => catalog(catalogState())],
      favorites: ['избранное', () => favoritesPage(conferences, favorites)],
      profile: ['личный кабинет', () => profilePage(profile, profileTab, participating(), favorites)],
    };
    const developmentPage = routes.find(([key]) => key === current);
    const activePage = Object.hasOwn(pages, current) ? pages[current] : undefined;
    const [title, view] = activePage || (developmentPage
      ? [developmentPage[1], development]
      : ['страница не найдена', () => '<section class="empty"><h1>Страница не найдена</h1><a href="#home">На главную</a></section>']);
    document.title = `НАУЧДВИЖ — ${title}`;
    const content = view();
    app.innerHTML = `${header(current)}<main id="main" tabindex="-1">${content}</main>${['home', 'conferences', 'profile', 'favorites'].includes(current) ? footer(current) : ''}`;
  }
  function refreshList() {
    document.querySelector('#conference-list').innerHTML = listMarkup(catalogState());
    document.querySelector('.search-panel').outerHTML = search(filters);
  }
  function notify(text) {
    const el = document.querySelector('#toast');
    el.textContent = text;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
  }
  function openModal(title, content) {
    modal.classList.remove('conference-detail');
    previousFocus = document.activeElement;
    modal.innerHTML = `<div class="modal-heading"><h2 id="modal-title">${esc(title)}</h2><button data-close aria-label="Закрыть окно">×</button></div>${content}`;
    modal.showModal();
  }
  modal.addEventListener('close', () => previousFocus?.isConnected && previousFocus.focus());
  modal.addEventListener('click', e => { if (e.target === modal) {
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      modal.close();
  } });
  function detail(id) {
    const conference = conferences.find(item => item.id === id);
    if (!conference)
      return;
    previousFocus = document.activeElement;
    modal.classList.add('conference-detail');
    modal.innerHTML = conferenceDetail(conference, favorites);
    modal.showModal();
  }
  function filterDialog() {
    const select = (name, title, values) => `<label>${title}<select name="${name}"><option value="">Все</option>${values.map(v => `<option ${filters[name] === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`;
    openModal('Фильтры конференций', `<form id="filter-form" class="form-grid">${select('category', 'Научное направление', [...new Set(conferences.map(c => c.category)), 'Архитектура', 'Строительство'])}${select('format', 'Формат участия', ['Смешанный', 'Заочно / Онлайн'])}${select('index', 'Индексация', ['РИНЦ', 'ВАК', 'Scopus'])}<label>Порядок<select name="sort"><option value="">Как в макете</option><option value="date" ${filters.sort === 'date' ? 'selected' : ''}>Ближайшая дата подачи</option></select></label><label class="checkbox"><input type="checkbox" name="free" ${filters.free ? 'checked' : ''}> Только бесплатные</label><label class="checkbox"><input type="checkbox" name="favorites" ${filters.favorites ? 'checked' : ''}> Только избранные</label><button class="primary" type="submit">Применить</button></form>`);
  }
  function editProfile(resume = false) {
    const fields = resume ? [['bio', 'О себе'], ['education', 'Образование'], ['specialty', 'Направление подготовки'], ['job', 'Текущая должность'], ['interests', 'Интересы через запятую']] : [['name', 'ФИО'], ['degree', 'Уровень образования'], ['email', 'Электронная почта'], ['phone', 'Телефон'], ['telegram', 'Telegram'], ['age', 'Возраст'], ['city', 'Город']];
    openModal(resume ? 'Редактировать резюме' : 'Редактировать профиль', `<form id="profile-form" class="form-grid">${fields.map(([name, label]) => `<label>${label}${name === 'bio' ? `<textarea name="${name}" maxlength="2000" rows="5">${esc(profile[name])}</textarea>` : `<input name="${name}" value="${esc(profile[name])}" type="${name === 'email' ? 'email' : name === 'age' ? 'number' : 'text'}" ${['name', 'email', 'age'].includes(name) ? 'required' : ''} ${name === 'age' ? 'min="1" max="120"' : 'maxlength="200"'}>`}</label>`).join('')}<button class="primary" type="submit">Сохранить</button></form>`);
  }
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('button, a');
    if (!button)
      return;
    if (button.matches('.skip-link')) {
      e.preventDefault();
      document.querySelector('#main').focus();
      document.querySelector('#main').scrollIntoView();
      return;
    }
    if (button.hasAttribute('data-close')) {
      modal.close();
      return;
    }
    if (button.matches('.menu-toggle')) {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      document.querySelector('.navigation').classList.toggle('open', open);
      return;
    }
    if (button.dataset.category) {
      filters.category = filters.category === button.dataset.category ? '' : button.dataset.category;
      page = 1;
      pageStart = 1;
      refreshList();
      return;
    }
    if (button.dataset.page) {
      page = Number(button.dataset.page);
      refreshList();
      document.querySelector('.catalog').scrollIntoView();
      return;
    }
    if (button.dataset.detail) {
      detail(button.dataset.detail);
      return;
    }
    if (button.dataset.favorite) {
      if (savingFavorite)
        return;
      savingFavorite = true;
      const id = button.dataset.favorite;
      const selected = !favorites.includes(id);
      try {
        await repository.setFavorite(id, selected);
        favorites = selected ? [...favorites, id] : favorites.filter(value => value !== id);
        if (document.querySelector('#conference-list'))
          refreshList();
        if (['profile', 'favorites'].includes(route()))
          render();
        if (button.isConnected && modal.contains(button)) {
          button.classList.toggle('saved', selected);
          button.setAttribute('aria-pressed', String(selected));
          button.setAttribute('aria-label', selected ? 'Удалить из избранного' : 'Добавить в избранное');
        }
        notify(selected ? 'Добавлено в избранное' : 'Удалено из избранного');
      }
      catch {
        notify('Не удалось сохранить избранное. Попробуйте ещё раз.');
      }
      finally {
        savingFavorite = false;
      }
      return;
    }
    if (button.dataset.tab) {
      profileTab = button.dataset.tab;
      render();
      document.querySelector(`[data-tab="${profileTab}"]`).focus();
      return;
    }
    if (button.dataset.achievement !== undefined) {
      const achievement = profile.achievements?.[Number(button.dataset.achievement)];
      if (achievement)
        openModal(achievement.title, `<p>${esc(achievement.detail || 'Подробности пока не добавлены.')}</p>`);
      return;
    }
    if (button.dataset.info) {
      const info = { about: ['О нас', 'НАУЧДВИЖ — твоя научная среда: поиск конференций, научные интересы и личный кабинет.'], partners: ['Партнёры', 'Информация о партнёрах пока не добавлена.'], contacts: ['Контакты', 'Контактные данные проекта пока не добавлены.'] };
      const [title, body] = info[button.dataset.info];
      openModal(title, `<p>${body}</p>`);
      return;
    }
    switch (button.dataset.action) {
      case 'account-menu': {
        const links = document.querySelector('#account-links');
        links.hidden = !links.hidden;
        button.setAttribute('aria-expanded', String(!links.hidden));
        break;
      }
      case 'scroll-catalog': {
        const advertisement = document.querySelector('.advertisement');
        advertisement.focus({ preventScroll: true });
        advertisement.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        break;
      }
      case 'previous-pages':
        pageStart = Math.max(1, pageStart - 2);
        refreshList();
        break;
      case 'shift-pages':
        pageStart += 2;
        refreshList();
        break;
      case 'filters':
        filterDialog();
        break;
      case 'reset':
        filters = {};
        page = 1;
        pageStart = 1;
        refreshList();
        break;
      case 'edit-profile':
        editProfile();
        break;
      case 'edit-resume':
        editProfile(true);
        break;
      case 'resume': {
        const panel = button.closest('.resume');
        panel.classList.add('expanded');
        button.hidden = true;
        button.setAttribute('aria-expanded', 'true');
        panel.querySelector('.resume-actions').hidden = false;
        fitResumeHeight();
        break;
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
        break;
      }
      case 'download-resume': {
        const content = [profile.name, profile.degree, '', profile.bio, '', 'Образование', profile.education, profile.specialty, '', 'Текущая должность', profile.job, '', 'Интересы', profile.interests, '', 'Контакты', profile.email, profile.phone, profile.telegram, profile.city].join('\n');
        const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Резюме — ' + profile.name + '.txt';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        break;
      }
    }
  });
  // Vertical mouse-wheel input moves the achievement strip; at its edges the page scrolls normally.
  document.addEventListener('wheel', e => {
    const strip = e.target.closest('.achievements');
    if (!strip || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))
      return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? strip.clientWidth : 1;
    const delta = e.deltaY * unit;
    const limit = strip.scrollWidth - strip.clientWidth;
    if ((delta > 0 && strip.scrollLeft < limit - 1) || (delta < 0 && strip.scrollLeft > 1)) {
      e.preventDefault();
      strip.scrollBy({ left: delta, behavior: 'instant' });
    }
  }, { passive: false });
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    const values = Object.fromEntries(new FormData(form));
    if (form.id === 'search-form') {
      e.preventDefault();
      filters.query = values.query;
      page = 1;
      pageStart = 1;
      refreshList();
    }
    if (form.id === 'filter-form') {
      e.preventDefault();
      filters = { ...filters, ...values, free: values.free === 'on', favorites: values.favorites === 'on' };
      page = 1;
      modal.close();
      refreshList();
    }
    if (form.id === 'profile-form') {
      e.preventDefault();
      if (savingProfile)
        return;
      savingProfile = true;
      const changes = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
      try {
        profile = await repository.updateProfile(changes);
        if (modal.contains(form) && modal.open)
          modal.close();
        render();
        notify('Изменения сохранены');
      }
      catch {
        notify('Не удалось сохранить профиль. Попробуйте ещё раз.');
      }
      finally {
        savingProfile = false;
      }
    }
  });
  document.addEventListener('keydown', e => { if (e.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    profileTab = profileTab === 'upcoming' ? 'past' : 'upcoming';
    render();
    document.querySelector(`[data-tab="${profileTab}"]`).focus();
  } });
  window.addEventListener('hashchange', () => { if (modal.open)
    modal.close(); page = 1; pageStart = 1; render(); window.scrollTo(0, 0); });
  render();
  function closeAccountMenu() { const links = document.querySelector('#account-links'); if (links) {
    links.hidden = true;
    document.querySelector('[data-action="account-menu"]').setAttribute('aria-expanded', 'false');
  } }
  document.addEventListener('click', e => { if (!e.target.closest('.account-menu'))
    closeAccountMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') {
    closeAccountMenu();
  } });
}
