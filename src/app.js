import { handlePromoClick } from './views/promo-banner.js';
import { requestMessage } from './services/request-error.js';
import { createFavoritesController, syncFavoriteButtons } from './features/favorites.js';
import { createProfileController } from './features/profile.js';
import { createCatalogController } from './features/catalog.js';
import { createRepository } from './services/frontend-repository.js';
import { escapeHtml as esc } from './shared/html.js';
import { routes, header, footer, development } from './views/site-layout.js';
import { catalog, favoritesPage } from './views/conference-catalog.js';
import { profilePage } from './views/profile-page.js';
import { conferenceDetail } from './views/conference-detail-dialog.js';
import { fitResumeHeight } from './ui/responsive-layout.js';
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const repository = createRepository(document.querySelector('meta[name="api-base"]').content);
app.textContent = 'Загрузка…';
let snapshot;
try {
  snapshot = { conferences: await repository.loadCatalog(), profile: null, favorites: [] };
}
catch (error) {
  app.innerHTML = '<main class="empty"><h1>Не удалось загрузить данные</h1><p>' + esc(requestMessage(error)) + '</p><button>Повторить</button></main>';
  app.querySelector('button').onclick = () => location.reload();
}
if (snapshot)
  start(snapshot);
function start({ conferences, profile, favorites }) {
  let accountLoading = false;
  let accountError = null;
  function accountView() {
    const message = accountLoading ? 'Загрузка аккаунта…' : accountError ? requestMessage(accountError) : 'Войдите в аккаунт, чтобы открыть личный кабинет и избранное.';
    return '<section class="empty"><h1>Аккаунт</h1><p>' + esc(message) + '</p><button data-action="reload-account" ' + (accountLoading ? 'disabled' : '') + '>Обновить данные аккаунта</button></section>';
  }
  async function loadAccount() {
    if (accountLoading) return;
    accountLoading = true;
    accountError = null;
    if (['profile', 'favorites'].includes(route())) render();
    try {
      const account = await repository.loadAccount();
      profile = account.profile;
      favorites = account.favorites;
    } catch (error) {
      accountError = error;
      profile = null;
      favorites = [];
    } finally {
      accountLoading = false;
      if (['profile', 'favorites'].includes(route())) render();
      syncFavoriteButtons(document, favorites, favoriteController.pending);
    }
  }

  let profileTab = 'upcoming';
  let previousFocus;
  let toastTimer;
  const route = () => location.hash.slice(1).split('?')[0] || 'home';
  function participating() { return conferences.filter(c => profile.participatingIds?.includes(c.id)); }
  function render() {
    const current = route();
    const pages = {
      home: ['твоя научная среда', () => catalog(catalogState())],
      conferences: ['Конференции', () => catalog(catalogState())],
      favorites: ['избранное', () => profile ? favoritesPage(conferences, favorites) : accountView()],
      profile: ['личный кабинет', () => profile ? profilePage(profile, profileTab, participating(), favorites) : accountView()],
    };
    const developmentPage = routes.find(([key]) => key === current);
    const activePage = Object.hasOwn(pages, current) ? pages[current] : undefined;
    const [title, view] = activePage || (developmentPage
      ? [developmentPage[1], development]
      : ['страница не найдена', () => '<section class="empty"><h1>Страница не найдена</h1><a href="#home">На главную</a></section>']);
    document.title = `НАУЧДВИЖ — ${title}`;
    const content = view();
    app.innerHTML = `${header(current)}<main id="main" tabindex="-1">${content}</main>${footer()}`;
    syncFavoriteButtons(document, favorites, favoriteController.pending);
    if (current === 'profile') profileController.syncResumeFile();
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
    syncFavoriteButtons(modal, favorites, favoriteController.pending);
    modal.showModal();
  }
  const favoriteController = createFavoritesController({
    repository,
    getFavorites: () => favorites,
    setFavorites: value => { favorites = value; },
    changed: () => {
      syncFavoriteButtons(document, favorites, favoriteController.pending);
      if (route() === 'favorites' && profile) {
        document.querySelector('#main').innerHTML = favoritesPage(conferences, favorites);
        syncFavoriteButtons(document, favorites, favoriteController.pending);
      }
      if (catalogController.state.filters.favorites && document.querySelector('#conference-list')) refreshList();
    },
    failed: error => notify(requestMessage(error)),
  });
  const catalogController = createCatalogController({
    conferences, getFavorites: () => favorites, route, openModal,
    afterRefresh: () => syncFavoriteButtons(document, favorites, favoriteController.pending),
  });
  const { catalogState, refreshList } = catalogController;
  const profileController = createProfileController({
    repository, getProfile: () => profile, openModal, modal, notify, fitResumeHeight,
    saved: value => { profile = value; render(); },
  });
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
    if (handlePromoClick(button)) return;
    if (catalogController.handleClick(button) || profileController.handleClick(button)) return;
    if (button.dataset.detail) {
      detail(button.dataset.detail);
      return;
    }
    if (button.dataset.favorite) {
      if (!profile) {
        notify(accountLoading ? 'Дождитесь загрузки аккаунта.' : accountError ? requestMessage(accountError) : 'Войдите в аккаунт, чтобы сохранить конференцию.');
        return;
      }
      await favoriteController.toggle(button.dataset.favorite);
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
      case 'reload-account':
        await loadAccount();
        break;
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
    if (['search-form', 'filter-form'].includes(form.id)) {
      e.preventDefault();
      if (form.id === 'filter-form') modal.close();
      catalogController.submit(form, values);
    }
    if (form.id === 'profile-form') {
      e.preventDefault();
      await profileController.save(form, values);
    }
  });
  document.addEventListener('keydown', e => { if (e.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    profileTab = profileTab === 'upcoming' ? 'past' : 'upcoming';
    render();
    document.querySelector(`[data-tab="${profileTab}"]`).focus();
  } });
  window.addEventListener('hashchange', () => { if (modal.open)
    modal.close(); catalogController.state.page = 1; catalogController.state.pageStart = 1; render(); window.scrollTo(0, 0); });
  render();
  loadAccount();
  window.addEventListener('auth-changed', loadAccount);
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
