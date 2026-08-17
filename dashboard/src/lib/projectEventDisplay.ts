import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/types";

// Shared by the Timeline page and the Project detail page's history
// section -- both render the same project_events rows, just scoped
// differently (market-wide vs. one project).

// event_type is open vocabulary (see the project_events schema comment),
// but every row today still carries the raw ProjectStatus value written
// by the mirror trigger off project_updates -- humanize whichever shape
// shows up rather than assuming one.
export function eventTypeLabel(eventType: string): string {
  if (eventType in PROJECT_STATUS_LABEL) {
    return PROJECT_STATUS_LABEL[eventType as ProjectStatus];
  }
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function groupEventsByDate<T extends { occurred_on: string }>(events: T[]): { date: string; events: T[] }[] {
  const groups: { date: string; events: T[] }[] = [];
  for (const event of events) {
    const last = groups[groups.length - 1];
    if (last && last.date === event.occurred_on) {
      last.events.push(event);
    } else {
      groups.push({ date: event.occurred_on, events: [event] });
    }
  }
  return groups;
}
