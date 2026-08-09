interface TimelineStep {
  title: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
}

interface RentalTimelineProps {
  steps: TimelineStep[];
}

const RentalTimeline = ({
  steps,
}: RentalTimelineProps) => {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-0">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="relative flex flex-1 items-start md:flex-col md:items-center"
        >
          {index !== 0 && (
            <div
              className={`absolute left-0 top-4 hidden h-0.5 w-full -translate-x-1/2 md:block ${
                step.completed || step.current
                  ? "bg-primary"
                  : "bg-border"
              }`}
            />
          )}

          <div
            className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
              step.completed
                ? "border-primary bg-primary text-white"
                : step.current
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-text-subtle"
            }`}
          >
            {step.completed ? "✓" : index + 1}
          </div>

          <div className="ml-4 md:ml-0 md:mt-3 md:text-center">
            <p
              className={`text-sm font-medium ${
                step.current
                  ? "text-primary"
                  : "text-text"
              }`}
            >
              {step.title}
            </p>

            {step.description && (
              <p className="mt-1 text-xs text-text-muted">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RentalTimeline;