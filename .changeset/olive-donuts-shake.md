---
"react-resource-view": minor
---

Stop shipping French. The calendar and the timeline formatted their dates with
a hardcoded `fr` date-fns locale, started their weeks on Monday and sorted their
rows with a French collation, and three labels were written in French. Dates now
follow the `dateLocale` port — English (US) by default — which also decides the
first day of the week and the collation:

```ts
import { fr } from "date-fns/locale"
configurePorts({ dateLocale: fr })
```

`getDateLocale()` and `getWeekStartsOn()` read it back.

**Breaking for applications relying on the former defaults:** "Aujourd'hui"
became "Today", "Nettoyer la recherche" became "Clear the search", and dates are
formatted in English until `dateLocale` is set. Translate the new labels through
`react-mini-i18n`, as with every other label of the package.
