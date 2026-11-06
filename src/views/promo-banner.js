
const slides=[
 ['ТВОЯ НАУЧНАЯ ТРАЕКТОРИЯ','Большие идеи начинаются с первого выступления','Найди конференцию по своей теме и узнай, как принять участие.','Открыть каталог','#conferences','01 / ИССЛЕДУЙ'],
 ['ВСЁ ВАЖНОЕ РЯДОМ','Собери свою подборку научных событий','Сохраняй интересные конференции, чтобы вернуться к ним в удобный момент.','Моё избранное','#favorites','02 / ВЫБИРАЙ'],
 ['ЗНАКОМСТВО С НАУКОЙ','Покажи, над чем работаешь','Расскажи о своих интересах, образовании и навыках в личном кабинете.','Открыть профиль','#profile','03 / РАЗВИВАЙСЯ']
];
export function promoBanner(){return '<section class="advertisement" tabindex="-1" aria-label="Возможности НаучДвиж" aria-roledescription="карусель">'+slides.map((s,i)=>'<article class="promo-slide" data-slide="'+i+'" '+(i?'hidden':'')+'><div class="promo-copy"><p class="promo-eyebrow">'+s[0]+'</p><h2>'+s[1]+'</h2><p>'+s[2]+'</p><a href="'+s[4]+'">'+s[3]+' <span aria-hidden="true">↗</span></a></div><div class="promo-art" aria-hidden="true"><span>'+s[5]+'</span><img src="/assets/illustrations/scientist-original.png" alt=""></div></article>').join('')+'<button class="promo-arrow previous" data-promo-step="-1" aria-label="Предыдущий баннер">‹</button><button class="promo-arrow next" data-promo-step="1" aria-label="Следующий баннер">›</button><div class="promo-bars">'+slides.map((s,i)=>'<button data-promo-index="'+i+'" aria-label="Баннер '+(i+1)+': '+s[1]+'" aria-pressed="'+(!i)+'"></button>').join('')+'</div><span class="sr-only promo-status" aria-live="polite"></span></section>';}
export function handlePromoClick(button){
 if(!button.matches('[data-promo-step],[data-promo-index]'))return false;
 const banner=button.closest('.advertisement'),items=[...banner.querySelectorAll('[data-slide]')];
 const current=items.findIndex(el=>!el.hidden);
 const next=button.hasAttribute('data-promo-index')?Number(button.dataset.promoIndex):(current+Number(button.dataset.promoStep)+items.length)%items.length;
 items.forEach((el,i)=>el.hidden=i!==next);
 banner.querySelectorAll('[data-promo-index]').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===next)));
 banner.querySelector('.promo-status').textContent='Баннер '+(next+1)+' из '+items.length;
 return true;
}
