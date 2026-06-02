import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const colorStyles = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    icon: "text-blue-600 dark:text-blue-400"
  },
  green: {
    bg: "bg-green-100 dark:bg-green-500/20",
    icon: "text-green-600 dark:text-green-400"
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-500/20",
    icon: "text-purple-600 dark:text-purple-400"
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-500/20",
    icon: "text-indigo-600 dark:text-indigo-400"
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-500/20",
    icon: "text-orange-600 dark:text-orange-400"
  },
  red: {
    bg: "bg-red-100 dark:bg-red-500/20",
    icon: "text-red-600 dark:text-red-400"
  }
};

export function ContainerHeader({ 
  icon: Icon, 
  title, 
  description, 
  themeColor = "blue", 
  action,
  className,
  ...props
}) {
  const styles = colorStyles[themeColor] || colorStyles.blue;

  return (
    <CardHeader 
      className={cn("border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent py-3 px-4", className)}
      {...props}
    >
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={cn("p-1.5 rounded-lg flex items-center justify-center", styles.bg)}>
              <Icon className={cn("w-4 h-4", styles.icon)} />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-base leading-none">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </CardHeader>
  );
}
