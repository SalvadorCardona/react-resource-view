/**
 * The packages `react-resource-view` needs, peer dependencies included.
 *
 * One list for the hero's picker, the react-resource-view card and the
 * Installation page, so the most visible command of the site cannot drift from
 * the peers that page documents. `react` and `react-dom` are left out: any
 * React project already has them.
 */
export const INSTALL_PACKAGES =
  "react-resource-view react-data-form react-mini-i18n resource-registry"

export const INSTALL_COMMAND = `pnpm add ${INSTALL_PACKAGES}`
