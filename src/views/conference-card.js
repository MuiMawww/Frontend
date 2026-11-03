import { escapeHtml as esc, tag } from '../shared/html.js';
function conferenceExcerpt(c) {
  if (c.excerpt) return c.excerpt;
  return `Научное направление: ${c.category}. Индексация материалов: ${c.indexes.join(', ')}. Участие: ${c.cost.toLowerCase()}.`;
}
export function card(c, favorites) {
  return `<article class="conference-card" data-id="${esc(c.id)}"><div class="conference-logo" aria-hidden="true"></div><div class="conference-body"><div class="tags">${[c.category,c.cost,...c.indexes].map(t=>tag(t)).join('')}</div><h2>${esc(c.title)}</h2><p class="conference-excerpt">${esc(conferenceExcerpt(c))}</p><div class="conference-bottom"><div class="conference-meta"><p>Формат: ${tag(c.format,'pale')}</p><p>Дата подачи заявки: ${tag(c.deadline,'pale')}</p></div><div class="card-actions"><button class="favorite ${favorites.includes(c.id)?'saved':''}" data-favorite="${esc(c.id)}" aria-pressed="${favorites.includes(c.id)}" aria-label="${favorites.includes(c.id)?'Удалить из избранного':'Добавить в избранное'}: ${esc(c.title)}"><span aria-hidden="true"></span></button><button class="details" data-detail="${esc(c.id)}">Подробнее</button></div></div></div></article>`;
}
