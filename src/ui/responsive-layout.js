function fitQuickFilters() {
  const row = document.querySelector('.quick-filters');
  if (!row)
    return;
  if (fitQuickFilters.row !== row) {
    fitQuickFilters.observer?.disconnect();
    fitQuickFilters.observer = new ResizeObserver(() => requestAnimationFrame(fitQuickFilters));
    fitQuickFilters.observer.observe(row);
    fitQuickFilters.row = row;
  }
  const buttons = [...row.children];
  buttons.forEach(b => b.hidden = false);
  const widths = buttons.map(b => b.getBoundingClientRect().width);
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const available = row.getBoundingClientRect().width;
  let used = 0;
  buttons.forEach((button, i) => {
    const required = widths[i] + (used ? gap : 0);
    const fits = i === 0 || used + required <= available + 0.5;
    button.hidden = !fits;
    if (fits)
      used += required;
  });
}
new MutationObserver(() => requestAnimationFrame(() => { fitQuickFilters(); fitResumeHeight(); })).observe(document.querySelector('#app'), { childList: true, subtree: true });
window.addEventListener('resize', fitQuickFilters);
document.fonts.ready.then(fitQuickFilters);
fitQuickFilters();
// Reserve room for the note, actions, education and job before fitting the biography.
export function fitResumeHeight() {
  const panel = document.querySelector('.resume');
  const activity = document.querySelector('.activity');
  const text = panel?.querySelector('.resume-summary');
  if (!text || !activity)
    return;
  panel.style.minHeight = '';
  text.style.webkitLineClamp = '1';
  const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
  const fixedHeight = panel.getBoundingClientRect().height - text.getBoundingClientRect().height;
  const available = activity.getBoundingClientRect().height - fixedHeight;
  const lines = Math.max(1, Math.floor(available / lineHeight));
  text.style.webkitLineClamp = String(panel.classList.contains('expanded') ? lines : Math.min(3, lines));
  if (panel.classList.contains('expanded') && window.matchMedia('(min-width:761px)').matches) {
    panel.style.minHeight = activity.getBoundingClientRect().height + 'px';
  }
}
window.addEventListener('resize', fitResumeHeight);
document.fonts.ready.then(fitResumeHeight);
fitResumeHeight();
