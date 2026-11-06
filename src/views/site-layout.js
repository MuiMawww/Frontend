import { heroIllustration } from './hero-illustration.js';
import { asset } from '../shared/html.js';
export const routes = [['teams','Команды'],['conferences','Конференции'],['antiplagiat','Антиплагиат'],['formatting','Автооформление'],['collection','Сборник']];
export function header(current) {
  const full = ['profile','teams','antiplagiat','formatting','collection'].includes(current);
  return `<header class="header ${full?'full-divider':''}" data-node-id="56:291">
    <a class="brand" href="#home" aria-label="НАУЧДВИЖ — главная">НАУЧДВИЖ</a>
    <button class="menu-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="navigation">☰</button>
    <nav id="navigation" class="navigation" aria-label="Основная навигация" style="--nav-asset:url('${asset(full?'decorations/navigation-full-dividers.svg':current==='conferences'?'decorations/catalog-navigation-dividers.svg':'decorations/home-navigation-dividers.svg')}')">
      ${routes.map(([key,title])=>`<a href="#${key}" ${current===key?'aria-current="page"':''}>${title}</a>`).join('')}
    </nav>
    <div class="account-menu"><button class="profile-link" data-action="account-menu" aria-label="Меню пользователя" aria-expanded="false" aria-controls="account-links" ${['profile','favorites'].includes(current)?'aria-current="page"':''}><span class="profile-icon" aria-hidden="true"></span></button><nav id="account-links" class="account-links" hidden aria-label="Меню пользователя"><a href="#profile">Личный кабинет</a><a href="#favorites">Избранное</a></nav></div>
  </header>`;
}
export function footer() {
  return `<footer class="site-footer">
    <div class="site-footer-transition" aria-hidden="true"></div>
    <div class="site-footer-content">
      <div class="site-footer-intro">
        <a class="site-footer-brand" href="#home" aria-label="НАУЧДВИЖ — главная">НАУЧДВИЖ</a>
        <p class="site-footer-tagline">Твоя научная среда</p>
        <p>Находи конференции по своим интересам, сохраняй важное и делай следующий шаг в науке.</p>
        <a class="site-footer-catalog" href="#conferences">Найти конференцию <span aria-hidden="true">↗</span></a>
      </div>
      <nav class="site-footer-links" aria-label="Разделы сайта в подвале">
        <h2>Разделы</h2>
        <a href="#conferences">Конференции</a><a href="#teams">Команды</a>
        <a href="#antiplagiat">Антиплагиат</a><a href="#formatting">Автооформление</a><a href="#collection">Сборник</a>
      </nav>
      <nav class="site-footer-links" aria-label="Информация о проекте">
        <h2>О проекте</h2>
        <button data-info="about">О нас</button><button data-info="partners">Партнёры</button><button data-info="contacts">Контакты</button>
        <a href="#profile">Личный кабинет</a><a href="#favorites">Избранное</a>
      </nav>
    </div>
    <div class="site-footer-bottom"><span>Научные события. Люди. Идеи.</span><span>НАУЧДВИЖ</span></div>
  </footer>`;
}
export function hero() {
  return `<section class="hero" data-node-id="77:5"><div class="hero-scene">${heroIllustration()}</div><div class="hero-gradient"></div><div class="hero-copy"><h1>Твоя научная среда</h1><h2>Найди конференцию для своего научного старта</h2><p>Выбирай научные события по своим интересам, сравнивай условия участия и сохраняй важное в одном месте.</p><button class="hero-button" data-action="scroll-catalog">Найти конференцию</button></div></section>`;
}
export function development() {
  return `<section class="development" data-node-id="158:280"><h1>Идёт активная разработка</h1><img src="${asset('illustrations/under-construction-robots.png')}" alt="Два робота в строительных касках работают над оборудованием"></section>`;
}
