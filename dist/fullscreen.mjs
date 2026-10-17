// Fullscreen must be requested synchronously from a user gesture.
let landscapeLocked = false;
export const fullscreenActive = () => typeof document !== 'undefined' && !!(document.fullscreenElement || document.webkitFullscreenElement);
export const fullscreenSupported = () => typeof document !== 'undefined' && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
export const enterGameFullscreen = async () => {
  if (fullscreenActive()) return { ok: true };
  if (!fullscreenSupported()) return { ok: false, reason: 'unsupported' };
  try {
    const element = document.documentElement;
    if (element.requestFullscreen) await element.requestFullscreen({ navigationUI: 'hide' });
    else await element.webkitRequestFullscreen();
    if (typeof screen !== 'undefined' && screen.orientation?.lock) {
      try { await screen.orientation.lock('landscape'); landscapeLocked = true; } catch {}
    }
    return { ok: fullscreenActive() };
  } catch { return { ok: false, reason: 'denied' }; }
};
export const releaseLandscapeLock = () => {
  if (!fullscreenActive() && landscapeLocked) {
    try { screen.orientation?.unlock?.(); } catch {}
    landscapeLocked = false;
  }
};
export const exitGameFullscreen = async () => {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await document.webkitExitFullscreen?.();
    releaseLandscapeLock(); return { ok: true };
  } catch { return { ok: false, reason: 'denied' }; }
};
