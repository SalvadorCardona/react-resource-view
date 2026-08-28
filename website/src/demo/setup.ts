import { enGB } from "date-fns/locale"
import { configurePorts as configureFormPorts, setFormConfig } from "react-data-form"
import { setTranslation } from "react-mini-i18n"
import { configurePorts as configureViewPorts } from "react-resource-view"
import { tanstackAdapter } from "react-resource-view/tanstack"

/**
 * Wires both libraries into this site, once.
 *
 * This is the configuration step the documentation describes, applied to the
 * documentation itself: the site is the first consumer of the packages it
 * documents, so a port that is awkward to configure here would be awkward to
 * configure anywhere.
 */
/**
 * The one route on this site that renders a full application.
 *
 * Written without the site's base on purpose. Links built by the view package
 * are handed to the router, which prepends its own basepath — adding it here
 * too would send the reader to /react-resource-view/react-resource-view/… on
 * GitHub Pages.
 */
export const PLAYGROUND_PATH = "/playground"

let configured = false

export function configureLibraries(): void {
  if (configured) return
  configured = true

  // Both packages share one dictionary, so a single call settles the wording of
  // every form field and every view on the site. A handful of the shipped
  // strings are still French — this is the mechanism that fixes that, and it is
  // the same one an application would use to translate the other way.
  setTranslation({
    Jour: "Day",
    Semaine: "Week",
    Mois: "Month",
    "Aujourd'hui": "Today",
    Continuer: "Continue",
    Suivant: "Next",
    Exporter: "Export",
    "Nettoyer la recherche": "Clear the search",
    "Effacer la recherche": "Clear the search",
    "Une erreur est survenue": "Something went wrong",
    "de plus": "more",
    "Date de fin": "End date",
    create: "Create",
    read: "Open",
    update: "Edit",
    delete: "Delete",
    next: "Next",
    previous: "Previous",
    order: "Order",
    remove: "Remove",
    drag: "Drag",
  })

  configureFormPorts({
    dateLocale: enGB,
    intlLocale: "en-GB",
    currency: "EUR",
  })

  setFormConfig({
    defaultForm: {
      label: { success: "Saved", error: "Some fields need another look" },
    },
  })

  configureViewPorts({
    // The demos run on this site's own router, which is the adapter the
    // documentation recommends — no bespoke navigation port for the docs.
    navigation: tanstackAdapter,
    dateLocale: enGB,
    // Query mode, aimed at /playground: a link built inside an embedded demo
    // has to leave the documentation page it sits on — the prose around it is
    // not a CRUD screen. It lands on the playground, on the very item that was
    // clicked, and the URL is shareable.
    routing: { mode: "query", param: "view", basePath: PLAYGROUND_PATH },
    appName: "Resource & Form",
    description:
      "Documentation for react-data-form and react-resource-view: data-driven React forms and CRUD views for JSON-LD APIs.",
    // The site's router owns the document head; letting the views write it too
    // would put two titles and two canonical links on every page.
    ownsDocumentHead: false,
    isDev: false,
  })
}
