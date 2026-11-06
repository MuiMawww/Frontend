let quickFiltersRow;
let quickFiltersObserver;
let quickFiltersFrame = 0;

function scheduleQuickFilters() {
  if (quickFiltersFrame) return;
  quickFiltersFrame = requestAnimationFrame(() => {
    quickFiltersFrame = 0;
    fitQuickFilters();
  });
}

function fitQuickFilters() {
  const row = document.querySelector('.quick-filters');
  if (quickFiltersRow !== row) {
    quickFiltersObserver?.disconnect();
    quickFiltersRow = row;
    if (row) {
      // Font changes can resize buttons without changing the row's width.
      quickFiltersObserver = new ResizeObserver(scheduleQuickFilters);
      [row, ...row.children].forEach(element => quickFiltersObserver.observe(element));
    }
  }
  if (!row) return;

  const buttons = [...row.children];
  // Read every natural width, then apply visibility in the same frame.
  buttons.forEach(button => button.hidden = false);
  const widths = buttons.map(button => button.getBoundingClientRect().width);
  const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
  const available = row.getBoundingClientRect().width - 1;
  let used = 0;
  buttons.forEach((button, index) => {
    const required = widths[index] + (used ? gap : 0);
    const fits = index === 0 || used + required <= available;
    button.hidden = !fits;
    if (fits) used += required;
  });
}

new MutationObserver(() => {
  scheduleQuickFilters();
  requestAnimationFrame(fitResumeHeight);
}).observe(document.querySelector('#app'), { childList: true, subtree: true });
window.addEventListener('resize', scheduleQuickFilters);
document.fonts.addEventListener('loadingdone', scheduleQuickFilters);
document.fonts.ready.then(scheduleQuickFilters);
scheduleQuickFilters();
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
