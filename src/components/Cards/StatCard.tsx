import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  loading?: boolean;
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  loading,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'glass-card flex min-h-[140px] flex-1 flex-col gap-3 p-5 text-white',
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">
          {title}
        </p>
        {icon}
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <>
          <p className="text-4xl font-semibold">{value}</p>
          {subtitle && (
            <p className="text-sm text-white/60 whitespace-nowrap">{subtitle}</p>
          )}
        </>
      )}
    </motion.div>
  );
};
