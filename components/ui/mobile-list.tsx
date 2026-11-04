import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Phone version of a data table: one tappable row per record. Shown below the md breakpoint;
 * pages hide their <Table> there (wrap it in `hidden md:block`).
 */
export function MobileList({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('divide-y divide-gray-100 md:hidden', className)} {...props} />;
}

interface MobileListItemProps {
  title: React.ReactNode;
  /** Shown top-right, next to the title (a status badge, an amount) */
  aside?: React.ReactNode;
  /** Lines under the title */
  children?: React.ReactNode;
  /** Buttons under the details; taps on them don't trigger onClick */
  actions?: React.ReactNode;
  /** Opens the record; the whole row becomes the tap target */
  onClick?: () => void;
}

export function MobileListItem({ title, aside, children, actions, onClick }: MobileListItemProps) {
  const body = (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 font-medium text-gray-900 break-words">{title}</div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children && <div className="mt-1 space-y-0.5 text-sm text-gray-500">{children}</div>}
      </div>
      {onClick && <ChevronRight className="mt-0.5 size-4 shrink-0 text-gray-400" aria-hidden="true" />}
    </div>
  );

  return (
    <li className="px-4 py-3">
      {onClick ? (
        <button type="button" onClick={onClick} className="-mx-1 block w-[calc(100%+0.5rem)] rounded-md px-1 text-left active:bg-gray-50">
          {body}
        </button>
      ) : (
        body
      )}
      {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
    </li>
  );
}
