/**
 * The packages `react-resource-view` needs, peer dependencies included.
 *
 * The Installation page's command, checked by `install.test.ts` against the
 * peers the published package declares, so it cannot drift from them. `react`
 * and `react-dom` are left out: any React project already has them.
 */
export const INSTALL_PACKAGES =
  "react-resource-view react-data-form react-mini-i18n resource-registry"

export const INSTALL_COMMAND = `pnpm add ${INSTALL_PACKAGES}`
