import type { ReactNode } from "react";

interface RentalStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
}

const RentalStatCard = ({
  title,
  value,
  description,
  icon,
}: RentalStatCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-text">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-text-subtle">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default RentalStatCard;