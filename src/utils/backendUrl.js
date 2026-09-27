/**
 * Backend root used by pages that are served by the backend itself.
 *
 * Vue3 keeps this separate from the admin API prefix. The proxy target takes
 * precedence so isolated local runs load the embedded page and all of its
 * absolute assets from the same backend JVM.
 */
export function getBackendBaseUrl() {
  const baseUrl = process.env.VUE_APP_PROXY_TARGET ||
    process.env.VUE_APP_BASE_URL ||
    process.env.VUE_APP_BASE_API ||
    ''
  return baseUrl.replace(/\/+$/, '')
}
