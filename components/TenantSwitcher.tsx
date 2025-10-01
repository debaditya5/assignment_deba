"use client";

import { useMemo } from "react";
import { useUrlParams } from "@lib/useUrlParams";
import { TENANTS } from "@data/tenants";
import { useAdmin } from "@lib/adminContext";

type Tenant = {
  id: string;
  name: string;
  accent: string;
};

export function TenantSwitcher() {
  const { get, set } = useUrlParams();

  const { isAdmin } = useAdmin();
  const defaultTenant = TENANTS[0] || { id: "alpha-health", name: "Alpha Health", accent: "alpha" };
  const currentTenant = get("tenant") || defaultTenant.id;
  
  // When admin is off, show the currently selected tenant (not just default)
  const currentTenantData = TENANTS.find(t => t.id === currentTenant) || defaultTenant;

  const options = useMemo(() => isAdmin ? TENANTS : [currentTenantData], [isAdmin, currentTenantData]);

  function onChange(value: string) {
    set("tenant", value);
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Tenant:</span>
        <span className="font-medium">{currentTenantData.name}</span>
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Tenant</span>
      <select
        aria-label="Tenant switcher"
        className="select"
        value={currentTenant}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((t: Tenant) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}


