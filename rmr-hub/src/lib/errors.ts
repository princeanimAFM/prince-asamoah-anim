/**
 * True when an error means a new version of RMR Hub went live while the page was open: the server
 * no longer recognises the form being saved, or the browser can't load old code. Reloading fixes it.
 */
export function isNewVersion(error: { message?: string } | null | undefined): boolean {
  return /Failed to find Server Action|ChunkLoadError|Loading chunk [\w-]+ failed/i.test(error?.message ?? "");
}
