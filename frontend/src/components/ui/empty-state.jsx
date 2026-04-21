import React from 'react';
import { FileQuestion } from 'lucide-react';

export function EmptyState({ 
  icon: IconComponent = FileQuestion, 
  title = "No data found", 
  description = "There is currently no data available to display.",
  action 
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 text-primary shadow-sm">
        {React.createElement(IconComponent, {
          className: "h-8 w-8",
        })}
      </div>
      <p className="page-kicker">Empty State</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
