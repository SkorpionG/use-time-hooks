import type { ReactNode } from 'react';

interface DemoCardProps {
  children: ReactNode;
}

export function DemoCard({ children }: DemoCardProps) {
  return (
    <div className="relative rounded-lg border bg-card p-8 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sky-500/5 via-cyan-500/5 to-rose-500/5 dark:from-sky-500/10 dark:via-cyan-500/10 dark:to-rose-500/10 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
