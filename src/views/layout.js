import { asset } from '../shared/html.js';
export const routes = [['teams','Команды'],['conferences','Конференции'],['antiplagiat','Антиплагиат'],['formatting','Автооформление'],['collection','Сборник']];
export function header(current) {
  const full = ['profile','teams','antiplagiat','formatting','collection'].includes(current);
  return `<header class="header ${full?'full-divider':''}" data-node-id="56:291">
    <a class="brand" href="#home" aria-label="НАУЧДВИЖ — главная">НАУЧДВИЖ</a>
    <button class="menu-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="navigation">☰</button>
    <nav id="navigation" class="navigation" aria-label="Основная навигация" style="--nav-asset:url('${asset(full?'fb703.svg':current==='conferences'?'15b00.svg':'e8110.svg')}')">
      ${routes.map(([key,title])=>`<a href="#${key}" ${current===key?'aria-current="page"':''}>${title}</a>`).join('')}
    </nav>
    <div class="account-menu"><button class="profile-link" data-action="account-menu" aria-label="Меню пользователя" aria-expanded="false" aria-controls="account-links" ${['profile','favorites'].includes(current)?'aria-current="page"':''}><span class="profile-icon" aria-hidden="true"></span></button><nav id="account-links" class="account-links" hidden aria-label="Меню пользователя"><a href="#profile">Личный кабинет</a><a href="#favorites">Избранное</a></nav></div>
  </header>`;
}
export function footer(current) {
  const lines = current==='profile'?'0a33d.svg':current==='conferences'?'ea049.svg':'83307.svg';
  return `<footer class="footer" data-node-id="${current==='profile'?'147:308':'163:397'}"><div class="footer-background" aria-hidden="true"><span></span><span></span><span></span><span></span></div><img class="footer-art" src="${asset(lines)}" alt=""><div class="footer-content"><h2>Контакты и информация</h2><button data-info="about">О нас</button><button data-info="partners">Партнёры</button><button data-info="contacts">Контакты</button></div></footer>`;
}
export function hero() {
  return `<section class="hero" data-node-id="77:5"><img class="hero-art" src="${asset('2c307.png')}" alt="Робот-учёный у доски с графиками и научными инструментами"><div class="hero-gradient"></div><div class="hero-copy"><h1>Твоя научная среда</h1><h2>Твоя наука начинается здесь</h2><p>Находи конференции, готовь научные работы и открывай новые возможности для себя.</p><button class="hero-button" data-action="scroll-catalog">Найти конференцию</button></div></section>`;
}
export function development() {
  return `<section class="development" data-node-id="158:280"><h1>Идёт активная разработка</h1><img src="${asset('6253f.png')}" alt="Два робота в строительных касках работают над оборудованием"></section>`;
}
