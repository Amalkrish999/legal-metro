import { cn } from '../lib/utils';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export type StatusType = 'Compliant' | 'Non-compliant' | 'Violation' | 'Review' | 'Pending';

export function StatusBadge({ status, className }: { status: StatusType | string, className?: string }) {
  let colorClass = '';
  let Icon = Clock;

  const sLower = status.toLowerCase();

  if (['compliant', 'approved', 'resolved', 'active', 'closed_compliant'].includes(sLower)) {
    colorClass = 'bg-status-success/10 text-status-success border-status-success/20 dark:bg-status-success/20';
    Icon = CheckCircle2;
  } else if (['violation', 'rejected', 'non-compliant', 'expired'].includes(sLower)) {
    colorClass = 'bg-status-error/10 text-status-error border-status-error/20 dark:bg-status-error/20';
    Icon = XCircle;
  } else if (['review', 'pending', 'pending_review', 'submitted — pending review', 'escalated', 'under review', 'issued', 'returned_for_correction', 'returned for correction'].includes(sLower)) {
    colorClass = 'bg-status-warning/10 text-status-warning border-status-warning/20 dark:bg-status-warning/20';
    Icon = Clock;
  } else {
    colorClass = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    Icon = Clock;
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', colorClass, className)}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
