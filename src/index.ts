/**
 * Message Annotator plugin, host half. Pure UI plugin: the empty apply keeps
 * the package visible to the host cordis.yml / Loader; the browser half ships
 * via exports["./client"], discovered through the package.json dsh.client
 * declaration. Staged annotations are browser-local per-session state, so a
 * client-only feature owns no host configuration.
 */

/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply(): void {}
