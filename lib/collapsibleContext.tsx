"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type CollapsibleContextType = {
  expandedSections: Set<string>;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  toggleSection: (sectionId: string) => void;
  expandAllSections: () => void;
  collapseAllSections: () => void;
  isExpanded: (sectionId: string) => boolean;
};

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);

export function CollapsibleProvider({ children }: { children: ReactNode }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const expandSection = (sectionId: string) => {
    setExpandedSections(prev => new Set([...prev, sectionId]));
  };

  const collapseSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
  };

  const toggleSection = (sectionId: string) => {
    if (expandedSections.has(sectionId)) {
      collapseSection(sectionId);
    } else {
      expandSection(sectionId);
    }
  };

  const expandAllSections = () => {
    // Expand all known sections
    const allSections = [
      "user-experience-metrics",
      "business-metrics", 
      "operational-metrics",
      "performance-metrics"
    ];
    setExpandedSections(new Set(allSections));
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  const isExpanded = (sectionId: string) => {
    return expandedSections.has(sectionId);
  };

  return (
    <CollapsibleContext.Provider value={{
      expandedSections,
      expandSection,
      collapseSection,
      toggleSection,
      expandAllSections,
      collapseAllSections,
      isExpanded
    }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (context === undefined) {
    throw new Error('useCollapsible must be used within a CollapsibleProvider');
  }
  return context;
}
