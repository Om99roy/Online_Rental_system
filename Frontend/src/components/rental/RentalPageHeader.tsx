import type { ReactNode } from "react";

interface RentalPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const RentalPageHeader = ({
  title,
  description,
  action,
}: RentalPageHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-text">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-text-muted">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
};

export default RentalPageHeader;