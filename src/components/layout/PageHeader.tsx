import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 border-b border-slate-200 bg-white shrink-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="mt-1 sm:mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2 sm:gap-3">{action}</div>}
    </div>
  );
}
