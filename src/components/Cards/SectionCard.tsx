import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
  className?: string;
};

export const SectionCard = ({
  title,
  subtitle,
  action,
  loading,
  error,
  children,
  className,
}: SectionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'glass-card flex w-full flex-col gap-4 p-5 text-white',
        'transition duration-200 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{title}</p>
          {subtitle && (
            <p className="text-sm text-white/60">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-24 w-full animate-pulse rounded-lg bg-white/5" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};
