import { escapeHtml as esc } from '../shared/html.js';
import { search, listMarkup } from '../views/conference-catalog.js';
export function createCatalogController({ conferences, getFavorites, route, openModal, afterRefresh }) {
  const state = { filters: {}, page: 1, pageStart: 1 };
  function catalogState() { return { conferences, ...state, favorites: getFavorites(), home: route() === 'home' }; }
  function refreshList() {
    document.querySelector('#conference-list').innerHTML = listMarkup(catalogState());
    document.querySelector('.search-panel').outerHTML = search(state.filters);
    afterRefresh();
  }
  function filterDialog() {
    const select = (name, title, values) => `<label>${title}<select name="${name}"><option value="">Все</option>${values.map(v => `<option ${state.filters[name] === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`;
    openModal('Фильтры конференций', `<form id="filter-form" class="form-grid">${select('category', 'Научное направление', [...new Set(conferences.map(c => c.category)), 'Архитектура', 'Строительство'])}${select('format', 'Формат участия', ['Смешанный', 'Заочно / Онлайн'])}${select('index', 'Индексация', ['РИНЦ', 'ВАК', 'Scopus'])}<label>Порядок<select name="sort"><option value="">Как в макете</option><option value="date" ${state.filters.sort === 'date' ? 'selected' : ''}>Ближайшая дата подачи</option></select></label><label class="checkbox"><input type="checkbox" name="free" ${state.filters.free ? 'checked' : ''}> Только бесплатные</label><label class="checkbox"><input type="checkbox" name="favorites" ${state.filters.favorites ? 'checked' : ''}> Только избранные</label><button class="primary" type="submit">Применить</button></form>`);
  }
  function handleClick(button) {
    if (button.dataset.category) {
      state.filters.category = state.filters.category === button.dataset.category ? '' : button.dataset.category;
      state.page = 1;
      state.pageStart = 1;
      refreshList();
      return true;
    }
    if (button.dataset.page) {
      state.page = Number(button.dataset.page);
      refreshList();
      document.querySelector('.catalog').scrollIntoView();
      return true;
    }

    switch (button.dataset.action) {
      case 'previous-pages':
        state.pageStart = Math.max(1, state.pageStart - 2);
        refreshList();
        return true;
      case 'shift-pages':
        state.pageStart += 2;
        refreshList();
        return true;
      case 'filters':
        filterDialog();
        return true;
      case 'reset':
        state.filters = {};
        state.page = 1;
        state.pageStart = 1;
        refreshList();
        return true;

      default: return false;
    }
  }
  function submit(form, values) {
    if (form.id === 'search-form') state.filters.query = values.query;
    else state.filters = { ...state.filters, ...values, free: values.free === 'on', favorites: values.favorites === 'on' };
    state.page = 1;
    state.pageStart = 1;
    refreshList();
  }
  return { state, catalogState, refreshList, handleClick, submit };
}
