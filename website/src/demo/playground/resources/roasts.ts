import { Flame } from "lucide-react"
import {
  ActionList,
  MomentInputController,
  NumberInputController,
  SelectInputController,
} from "react-data-form"
import {
  calendarViewOptionFactory,
  createViewResource,
  tableViewOptionFactory,
  timelineViewOptionFactory,
} from "react-resource-view"
import {
  ROAST_PROFILES,
  ROAST_STATUSES,
  ROASTERS,
  ROASTS_ID,
  type Roast,
} from "@/demo/playground/adminData"
import { POPUP } from "@/demo/playground/resources/shared"

/**
 * The week on the roasters. A record with a start and an end is what a
 * calendar and a timeline draw — so this resource opens on the calendar, and
 * the same ten batches read as lanes per machine one click away.
 */
export const roastsResource = createViewResource<Roast>(ROASTS_ID, {
  name: "Roasts",
  scope: "admin",
  icon: Flame,
  canRead: true,
  canCreate: true,
  canUpdate: true,
  canDelete: true,
  view: {
    name: "Roasting schedule",
    description:
      "Every batch going through the roasters this week: when, on which machine, and whether it passed cupping.",
    form: {
      inputs: {
        batch: { label: "Batch", required: true },
        origin: { label: "Origin" },
        roaster: {
          label: "Roaster",
          controller: SelectInputController,
          valueOptions: ROASTERS,
        },
        profile: {
          label: "Profile",
          controller: SelectInputController,
          valueOptions: ROAST_PROFILES,
        },
        weight: { label: "Kilograms", controller: NumberInputController },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: ROAST_STATUSES,
        },
        startAt: { label: "Starts at", controller: MomentInputController },
        endAt: { label: "Ends at", controller: MomentInputController },
      },
    },
    formFilter: {
      inputs: {
        roaster: {
          label: "Roaster",
          controller: SelectInputController,
          valueOptions: ROASTERS,
        },
        status: {
          label: "Status",
          controller: SelectInputController,
          valueOptions: ROAST_STATUSES,
        },
      },
    },
    viewVariants: [
      calendarViewOptionFactory({
        name: "Calendar",
        mode: "week",
        dateKey: "startAt",
        endDateKey: "endAt",
        titleKey: "batch",
        colorKey: "roaster",
        hourStart: 6,
        hourEnd: 18,
      }),
      timelineViewOptionFactory<Roast>({
        name: "Timeline",
        startDateKey: "startAt",
        endDateKey: "endAt",
        titleKey: "batch",
        groupKey: "roaster",
        groupsLabel: "Roasters",
        statusKey: "status",
        daysToShow: 7,
        showUnassigned: false,
        colorByStatus: {
          planned: "var(--color-view)",
          roasting: "var(--color-form)",
          done: "var(--color-primary)",
          rejected: "var(--color-destructive)",
        },
      }),
      tableViewOptionFactory({ name: "Table" }),
    ],
  },
  views: {
    [ActionList.create]: { name: "New batch", ...POPUP },
    [ActionList.update]: { name: "Edit a batch", ...POPUP },
    [ActionList.delete]: { name: "Delete a batch", ...POPUP },
  },
})
