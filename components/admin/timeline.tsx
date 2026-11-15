export type TimelineEvent = { id: string; title: string; description?: string; occurredAt: string; actor?: string; tone?: "neutral" | "success" | "warning" | "error" };
export function Timeline({ events, emptyMessage = "No history is available." }: { events: TimelineEvent[]; emptyMessage?: string }) {
  if (!events.length) return <p className="timeline-empty">{emptyMessage}</p>;
  return <ol className="timeline">{events.map((event) => <li className={`timeline__event timeline__event--${event.tone ?? "neutral"}`} key={event.id}><span className="timeline__marker" aria-hidden="true" /><div><h3>{event.title}</h3>{event.description && <p>{event.description}</p>}<p className="timeline__meta"><time dateTime={event.occurredAt}>{event.occurredAt}</time>{event.actor && <> · {event.actor}</>}</p></div></li>)}</ol>;
}
