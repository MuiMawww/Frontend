import { escapeHtml as esc, tag } from '../shared/html.js';
import { card } from './conference-card.js';
import { hero } from './site-layout.js';
import { filterConferences } from '../domain/conference-filters.js';
const categories = ['Программирование','Инженерия','Медицина','Архитектура','Строительство','Экономика'];
export function search(filters) {
  return `<section class="search-panel" aria-label="Поиск конференций" data-node-id="38:112">
    <form id="search-form" class="search-form"><label class="sr-only" for="query">Название или ключевое слово</label><input id="query" name="query" type="search" placeholder="Введите ключевое слово или название" value="${esc(filters.query||'')}"><button type="submit"><span class="search-icon" aria-hidden="true"></span><span>Найти</span></button></form>
    <div class="quick-filters"><button data-action="filters" class="filter-button">Фильтры</button>${categories.map(c=>`<button data-category="${c}" aria-pressed="${filters.category===c}">${c}</button>`).join('')}</div>
    <div class="filter-status" ${Object.values(filters).some(Boolean)?'':'hidden'}><span>${filters.favorites?'Избранные конференции':'Применены фильтры'}</span><button data-action="reset">Сбросить</button></div>
  </section>`;
}
export function listMarkup({ conferences, filters, favorites, page, pageStart, home }) {
  const results = filterConferences(conferences, filters, favorites);
  const isHome = home;
  const perPage = 6;
  const count = Math.ceil(results.length/perPage);

  page = Math.max(1, Math.min(page, count));
  pageStart = Math.max(1, Math.min(pageStart, count));
  const visible = isHome ? results : results.slice((page-1)*perPage,page*perPage);
  return `<div class="sr-only" role="status">Найдено конференций: ${results.length}</div>${visible.length?visible.map(c => card(c, favorites)).join(''):`<div class="empty"><h2>Конференции не найдены</h2><p>Попробуйте изменить запрос или сбросить фильтры.</p><button data-action="reset">Сбросить фильтры</button></div>`}
    ${isHome?'<a class="show-more" href="#conferences">Показать больше</a>':count>1?`<nav class="pagination" aria-label="Страницы конференций"><button class="page-shift page-back" data-action="previous-pages" ${pageStart===1?'disabled':''} aria-label="Предыдущие номера страниц"></button>${Array.from({length:Math.min(3,count-pageStart+1)},(_,offset)=>pageStart+offset-1).map(i=> `<button data-page="${i+1}" ${page===i+1?'aria-current="page"':''} aria-label="Страница ${i+1}">${i+1}</button>`).join('')}<button class="page-shift" data-action="shift-pages" ${pageStart+2>=count?'disabled':''} aria-label="Следующие номера страниц"></button></nav>`:''}`;
}
export function catalog(state) {
  return `${state.home?hero():''}<section class="catalog ${state.home?'home-catalog':''}" aria-label="Каталог конференций">${state.home?'<div class="advertisement" tabindex="-1" aria-label="Место для информации о проекте" data-node-id="37:89"></div>':''}${search(state.filters)}<div id="conference-list" class="conference-list">${listMarkup(state)}</div></section>`;
}
export function favoritesPage(conferences, favorites) {
  const saved=conferences.filter(c=>favorites.includes(c.id));
  return `<section class="favorites-page" data-node-id="203:2"><h1>Мои избранные</h1><div class="conference-list">${saved.length?saved.map(c => card(c, favorites)).join(''):'<div class="empty"><h2>Пока ничего не добавлено</h2><p>Нажмите на звезду рядом с конференцией, чтобы сохранить её здесь.</p><a class="details" href="#conferences">Найти конференцию</a></div>'}</div></section>`;
}
