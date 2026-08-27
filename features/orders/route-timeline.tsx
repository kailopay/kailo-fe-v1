import type { RouteStatusView, RouteStepState } from "./route-status";

type RouteTimelineProps = {
  view: RouteStatusView;
};

export function RouteTimeline({ view }: RouteTimelineProps): React.ReactElement {
  return (
    <ol className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Order progress">
      {view.steps.map((step, index) => (
        <li className="relative flex items-center gap-3 sm:block" key={step.label}>
          {index < view.steps.length - 1 && (
            <span aria-hidden className="absolute left-3 top-7 hidden h-px w-[calc(100%-0.75rem)] bg-line sm:block" />
          )}
          <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${stepTone(step.state)}`}>
            {step.state === "complete" ? (
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                <path d="m3 8.5 3 3L13 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
              </svg>
            ) : index + 1}
          </span>
          <span className="relative mt-0.5 text-sm font-semibold text-ink sm:mt-3 sm:block">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}

function stepTone(state: RouteStepState): string {
  switch (state) {
    case "complete":
      return "bg-aqua text-ink";
    case "current":
      return "bg-coral text-ink ring-4 ring-coral/20";
    case "failed":
      return "bg-sun text-ink";
    case "pending":
      return "bg-paper-recess text-ink-3";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
