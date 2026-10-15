// Plays Astra trailers in an on-page player instead of sending visitors to YouTube.
// Without JavaScript, or with a modifier key held, links still open YouTube normally.
// No YouTube request is made until a visitor chooses to play a trailer.
export const ASTRA_TRAILERS = new Set([
  'fNwTSZKmpis', '96weNjdV0A4', 'YJNUH5L8cFc', '7IXqTkSNAvM', '3HxP2U8cevY',
  'KiO5WABFP6c', 'ipDFxcGCqcY', 'o0Vr7hwgJsc', 'F4SyiYhcBBQ',
]);

export function trailerIdFrom(href) {
  try {
    const url = new URL(href);
    if (!/(^|\.)youtube\.com$/.test(url.hostname) || url.pathname !== '/watch') return null;
    const id = url.searchParams.get('v');
    return ASTRA_TRAILERS.has(id) ? id : null;
  } catch { return null; }
}

export function embedUrl(id) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
}

function titleFor(link) {
  const label = link.getAttribute('aria-label') || '';
  const named = link.querySelector('strong, h3')?.textContent || link.closest('article')?.querySelector('h3')?.textContent;
  return (named || label.replace(/^Watch (the )?/i, '') || 'Astra trailer').trim();
}

if (typeof document !== 'undefined' && typeof HTMLDialogElement !== 'undefined') {
  let dialog, stage, heading, opener;

  const build = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'astra-player';
    dialog.setAttribute('aria-labelledby', 'astra-player-title');
    dialog.innerHTML = '<div class="astra-player-inner"><div class="astra-player-bar"><p id="astra-player-title"></p><button type="button" class="astra-player-close" aria-label="Close trailer">Close <span aria-hidden="true">✕</span></button></div><div class="astra-player-stage"></div><p class="astra-player-cta">Want a trailer like this for your book? <a href="/#start">Get my free review</a></p></div>';
    document.body.append(dialog);
    stage = dialog.querySelector('.astra-player-stage');
    heading = dialog.querySelector('#astra-player-title');
    dialog.querySelector('.astra-player-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.astra-player-cta a').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { stage.replaceChildren(); opener?.focus({ preventScroll: true }); });
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href*="youtube.com/watch"]');
    if (!link) return;
    const id = trailerIdFrom(link.href);
    if (!id) return;
    event.preventDefault();
    if (!dialog) build();
    opener = link;
    const title = titleFor(link);
    heading.textContent = title;
    const frame = document.createElement('iframe');
    frame.title = `${title} — trailer`;
    frame.src = embedUrl(id);
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    stage.replaceChildren(frame);
    dialog.showModal();
  });
}
