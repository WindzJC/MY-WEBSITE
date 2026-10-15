// No player or third-party video request exists until an explicit activation.
const player = document.querySelector('[data-video-id]');
const allowedVideos = new Set(['fNwTSZKmpis', 'luX6gA05Si4']);

function playTrailer() {
  if (!player || !allowedVideos.has(player.dataset.videoId)) return;
  let frame = player.querySelector('iframe');
  if (!frame) {
    frame = document.createElement('iframe');
    frame.title = `${player.dataset.videoTitle} — YouTube video player`;
    frame.src = `https://www.youtube-nocookie.com/embed/${player.dataset.videoId}?autoplay=1&playsinline=1`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(frame);
  }
  player.scrollIntoView({ behavior: 'instant', block: 'center' });
  frame.focus({ preventScroll: true });
}

player?.querySelector('button')?.addEventListener('click', playTrailer);
document.querySelector('[data-play-trailer]')?.addEventListener('click', (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  playTrailer();
});
