"use client";

import { SystemStatus } from "@lib/aggregations";

type Props = {
  status: SystemStatus;
  userGuidance: string;
};

export function UserGuidanceBox({ status, userGuidance }: Props) {
  const getStyles = () => {
    switch (status) {
      case 'operational':
        return {
          containerClass: 'bg-green-50 border-green-200',
          iconClass: 'text-green-600',
          textClass: 'text-green-800',
          icon: '✓'
        };
      case 'minor-delays':
        return {
          containerClass: 'bg-amber-50 border-amber-200',
          iconClass: 'text-amber-600',
          textClass: 'text-amber-800',
          icon: '⏱'
        };
      case 'service-disruption':
        return {
          containerClass: 'bg-red-50 border-red-200',
          iconClass: 'text-red-600',
          textClass: 'text-red-800',
          icon: '⚠'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-lg border p-4 ${styles.containerClass}`}>
      <div className="flex items-start gap-3">
        <div className={`text-xl ${styles.iconClass}`}>
          {styles.icon}
        </div>
        <div>
          <h3 className={`font-semibold mb-1 ${styles.textClass}`}>
            What this means for you
          </h3>
          <p className={`text-sm ${styles.textClass}`}>
            {userGuidance}
          </p>
        </div>
      </div>
    </div>
  );
}
