import React from 'react';
import { FileQuestion } from 'lucide-react';

export function EmptyState({ 
  icon: IconComponent = FileQuestion, 
  title = "No data found", 
  description = "There is currently no data available to display.",
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card border border-border rounded-xl shadow-sm min-h-[300px]">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        {React.createElement(IconComponent, {
          className: "w-8 h-8 text-muted-foreground",
        })}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 pb-2">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
