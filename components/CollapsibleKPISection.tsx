"use client";

import { ReactElement, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { KPIGrid } from "./KPIGrid";
import { useCollapsible } from "@lib/collapsibleContext";

type Props = {
  title: string;
  children: ReactElement[];
  defaultExpanded?: boolean;
  sectionId: string;
  additionalContent?: ReactElement; // For charts or other content below KPIs
  kpiAverages?: any; // Pass the true averages for reference lines
  cleanKPIData?: any; // Pass clean KPI data for all KPIs
};

export function CollapsibleKPISection({ title, children, defaultExpanded = false, sectionId, additionalContent, kpiAverages, cleanKPIData }: Props) {
  const { isExpanded, toggleSection, expandSection } = useCollapsible();
  const expanded = isExpanded(sectionId);

  useEffect(() => {
    if (defaultExpanded) {
      expandSection(sectionId);
    }
    
    // Listen for expand all sections event
    const handleExpandAll = () => {
      expandSection(sectionId);
    };
    
    window.addEventListener('expandAllSections', handleExpandAll);
    
    return () => {
      window.removeEventListener('expandAllSections', handleExpandAll);
    };
  }, [defaultExpanded, sectionId, expandSection]);

  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => toggleSection(sectionId)}
      >
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-500 pl-3">{title}</h2>
        <div className="flex items-center">
          {expanded ? (
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="mt-4 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards] space-y-4">
          <KPIGrid columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-4" kpiAverages={kpiAverages} cleanKPIData={cleanKPIData}>
            {children}
          </KPIGrid>
          {additionalContent && (
            <div className="w-full">
              {additionalContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
