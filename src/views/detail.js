import { escapeHtml as esc, tag } from '../shared/html.js';

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function conferenceDetail(c, favorites) {
  const participationUrl = safeUrl(c.participationUrl);
  const paragraphs = c.description?.map(({ text, url, label }) => {
    const href = safeUrl(url);
    const link = href ? ` <a href="${esc(href)}" target="_blank" rel="noopener">${esc(label || href)}</a>` : '';
    return `<p>${esc(text)}${link}</p>`;
  }).join('');
  const description = '<h3>Описание конференции</h3>' + (paragraphs || `<p>Направление: ${esc(c.category)}. Формат: ${esc(c.format)}. Срок подачи заявки: ${esc(c.deadline)}.</p>`);
  return `<div class="detail-top"><div class="detail-tags">${[c.category,c.cost,...c.indexes].map(t=>tag(t)).join('')}</div><button data-close aria-label="Закрыть окно"><img src="/assets/detail-close.svg" alt=""></button></div><div class="detail-identity"><div class="detail-logo" role="img" aria-label="Место для логотипа конференции"></div><h2 id="modal-title">${esc(c.title)}</h2></div><div class="detail-description">${description}</div><div class="detail-actions"><button class="favorite ${favorites.includes(c.id)?'saved':''}" data-favorite="${esc(c.id)}" aria-pressed="${favorites.includes(c.id)}" aria-label="${favorites.includes(c.id)?'Удалить из избранного':'Добавить в избранное'}"><span aria-hidden="true"></span></button>${participationUrl?`<a class="details" href="${esc(participationUrl)}" target="_blank" rel="noopener">Участвовать</a>`:'<button class="details" disabled title="Ссылка организатора пока не добавлена">Участвовать</button>'}</div>`;

}
