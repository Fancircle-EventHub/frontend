/**
 * Exit browser fullscreen without throwing when APIs are missing or reject (e.g. "Permissions check failed").
 */
export function safeExitFullscreen(): void {
  try {
    void Promise.resolve(document.exitFullscreen?.()).catch(() => {});
    const doc = document as Document & { webkitExitFullscreen?: () => void | Promise<void> };
    void Promise.resolve(doc.webkitExitFullscreen?.()).catch(() => {});
  } catch {
    /* ignore */
  }
}
