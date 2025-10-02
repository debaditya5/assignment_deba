"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUrlParams } from "@lib/useUrlParams";
import { downloadAllTabsAsPdf } from "@lib/csv";
import { TENANTS } from "@data/tenants";
import { TenantSwitcher } from "./TenantSwitcher";
import { TimeRangePicker } from "./TimeRangePicker";
import { useAdmin } from "@lib/adminContext";

function titleForPath(pathname: string): string {
  if (pathname === "/") return "Benefits Coverage Agent – Command Center";
  if (pathname.startsWith("/reliability")) return "Benefits Coverage Agent – Reliability & Errors";
  return "Benefits Coverage Agent";
}

export function HeaderBar() {
  const pathname = usePathname();
  const { get } = useUrlParams();
  const title = titleForPath(pathname ?? "/");
  const { isAdmin, setIsAdmin } = useAdmin();
  
  // Get current tenant and range
  const tenantId = get("tenant") || (TENANTS[0]?.id || "alpha-health");
  const range = get("range") || "7d";
  const currentTenant = TENANTS.find(t => t.id === tenantId) || TENANTS[0] || { id: "alpha-health", name: "Alpha Health", accent: "alpha" };
  
  // Build URL with current parameters
  const buildUrlWithParams = (basePath: string) => {
    const params = new URLSearchParams();
    params.set("tenant", tenantId);
    params.set("range", range);
    return `${basePath}?${params.toString()}`;
  };
  
  const handleDownloadData = async () => {
    // Expand sections if we're on Command Center or Reliability page
    if (pathname === "/" || pathname === "/reliability") {
      // Dispatch custom event to expand all sections
      window.dispatchEvent(new CustomEvent('expandAllSections'));
      
      // Wait a bit for the sections to expand and render
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    downloadAllTabsAsPdf(currentTenant.name);
  };
  
  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <div className="w-full px-2 py-4 flex items-center justify-between">
      <Link href={buildUrlWithParams("/") as any} className="font-semibold text-lg">
        {title}
      </Link>
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-4 text-sm">
          <Link href={buildUrlWithParams("/") as any} className="hover:underline">
            Command Center
          </Link>
          <Link href={buildUrlWithParams("/reliability") as any} className="hover:underline">
            Reliability & Errors
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span>Admin</span>
            <div 
              className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${isAdmin ? 'bg-blue-600' : 'bg-gray-200'}`}
              onClick={toggleAdmin}
            >
              <div 
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isAdmin ? 'translate-x-6' : 'translate-x-1'}`}
                style={{ marginTop: '2px' }}
              />
            </div>
          </label>
          <TenantSwitcher />
          {pathname === "/" && <TimeRangePicker />}
          <button
            onClick={handleDownloadData}
            className="btn btn-primary"
            aria-label="Download all data as PDF"
          >
            Download Data
          </button>
        </div>
      </div>
    </div>
  );
}


