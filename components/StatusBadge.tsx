"use client";

import { SystemStatus } from "@lib/aggregations";

type Props = {
  status: SystemStatus;
  title: string;
  description: string;
  uptime: number;
  errorRate: number;
};

export function StatusBadge({ status, title, description, uptime, errorRate }: Props) {
  const getStatusStyles = () => {
    switch (status) {
      case 'operational':
        return {
          containerClass: 'bg-green-50 border-green-200',
          titleClass: 'text-green-800',
          descriptionClass: 'text-green-700',
          badgeClass: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'minor-delays':
        return {
          containerClass: 'bg-amber-50 border-amber-200',
          titleClass: 'text-amber-800',
          descriptionClass: 'text-amber-700',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'service-disruption':
        return {
          containerClass: 'bg-red-50 border-red-200',
          titleClass: 'text-red-800',
          descriptionClass: 'text-red-700',
          badgeClass: 'bg-red-100 text-red-800 border-red-300'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`rounded-lg border-2 p-6 ${styles.containerClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`text-2xl font-bold mb-2 ${styles.titleClass}`}>
            {title}
          </div>
          <p className={`text-lg mb-4 ${styles.descriptionClass}`}>
            {description}
          </p>
          <div className="flex gap-4 text-sm">
            <div className={`px-3 py-1 rounded-full border ${styles.badgeClass}`}>
              Uptime: {uptime}%
            </div>
            <div className={`px-3 py-1 rounded-full border ${styles.badgeClass}`}>
              Error Rate: {errorRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
