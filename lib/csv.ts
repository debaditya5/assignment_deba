import React from 'react';

export function toCsv(rows: any[], headers?: string[]): string {
  if (!rows || rows.length === 0) return "";
  const keys = headers ?? Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const head = keys.join(",");
  const body = rows.map((r) => keys.map((k) => escape(r[k])).join(",")).join("\n");
  return head + "\n" + body;
}

export function toBiJson(rows: any[]): any[] {
  return rows;
}

export function downloadCsv(filename: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyJson(rows: any[]) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
  }
}

export async function downloadChartAsPdf(chartRef: React.RefObject<HTMLDivElement>, filename: string) {
  if (typeof window === "undefined" || !chartRef.current) return;
  
  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png', 0.95);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth - 20; // Leave margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating chart PDF:', error);
  }
}

// Global download function to capture current page with visual tiles and charts
export async function downloadAllTabsAsPdf(tenantName: string) {
  if (typeof window === "undefined") {
    console.warn('PDF download only works in browser environment');
    return;
  }
  
  try {
    // Import html2canvas and jsPDF
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    // Get current search parameters
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    const range = searchParams.get("range") || "14d";
    
    // Show progress message with higher z-index to avoid capture
    const progressDiv = document.createElement('div');
    progressDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 99999; text-align: center; min-width: 300px;';
    progressDiv.innerHTML = '<div style="font-size: 16px; font-weight: bold;">Generating PDF...</div><div id="progress-status" style="margin-top: 10px;">Preparing content...</div>';
    document.body.appendChild(progressDiv);
    
    const updateProgress = (message: string) => {
      const statusEl = document.getElementById('progress-status');
      if (statusEl) statusEl.textContent = message;
    };
    
    // Create PDF first
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title page
    pdf.setFontSize(24);
    pdf.text('Dashboard Report', 20, 40);
    
    pdf.setFontSize(18);
    pdf.text(`Time Range: ${range}`, 20, 70);
    pdf.text(`Tenant: ${tenantName}`, 20, 90);
    
    // Just capture the current page
    const currentPath = window.location.pathname;
    let pageTitle = 'Command Center';
    if (currentPath.includes('funnel')) pageTitle = 'Trends';
    if (currentPath.includes('reliability')) pageTitle = 'Reliability & Errors';
    
    // Find main content first
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      alert('Main content not found');
      if (document.body.contains(progressDiv)) {
        document.body.removeChild(progressDiv);
      }
      return;
    }

    // Force all lazy-loaded content to render by scrolling through the entire page
    updateProgress('Loading all content...');
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollSteps = Math.ceil(scrollHeight / viewportHeight);
    
    // Scroll down in steps
    for (let i = 0; i <= scrollSteps; i++) {
      window.scrollTo(0, i * viewportHeight);
      await new Promise(r => setTimeout(r, 300));
    }
    
    // Scroll to very bottom
    updateProgress('Rendering charts and tables...');
    window.scrollTo(0, scrollHeight);
    await new Promise(r => setTimeout(r, 1500));
    
    // Scroll back to top
    updateProgress('Preparing capture...');
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 1000));
    
    // Hide progress dialog and controls temporarily
    progressDiv.style.display = 'none';
    const controlsContainer = document.querySelector('div.flex.flex-wrap.items-center.justify-between.gap-3');
    if (controlsContainer) {
      (controlsContainer as HTMLElement).style.display = 'none';
    }
    
    // Wait for reflow and final render
    await new Promise(r => setTimeout(r, 1000));
    
    // Restore controls before capture
    if (controlsContainer) {
      (controlsContainer as HTMLElement).style.display = 'block';
    }
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add temporary padding to mainContent to prevent clipping and remove bottom spacing
    const originalPaddingTop = (mainContent as HTMLElement).style.paddingTop;
    const originalPaddingBottom = (mainContent as HTMLElement).style.paddingBottom;
    const originalMarginBottom = (mainContent as HTMLElement).style.marginBottom;
    (mainContent as HTMLElement).style.paddingTop = '100px';
    (mainContent as HTMLElement).style.paddingBottom = '0px';
    (mainContent as HTMLElement).style.marginBottom = '0px';
    
    // Also remove spacing from child elements
    const childDiv = mainContent.querySelector('div.space-y-6');
    const originalChildPadding = childDiv ? (childDiv as HTMLElement).style.paddingBottom : '';
    const originalChildMargin = childDiv ? (childDiv as HTMLElement).style.marginBottom : '';
    if (childDiv) {
      (childDiv as HTMLElement).style.paddingBottom = '0px';
      (childDiv as HTMLElement).style.marginBottom = '0px';
    }
    
    // Remove py-4 padding from main temporarily
    const mainClasses = (mainContent as HTMLElement).className;
    (mainContent as HTMLElement).className = mainClasses.replace('py-4', '');
    
    await new Promise(r => setTimeout(r, 300));
    
    // Capture the entire main content area - works for all pages
    const canvas = await html2canvas(mainContent as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      foreignObjectRendering: true,
      windowWidth: mainContent.scrollWidth,
      windowHeight: mainContent.scrollHeight,
      onclone: (clonedDoc) => {
        // Remove any dark backgrounds or separators
        const clonedMain = clonedDoc.querySelector('main');
        if (clonedMain) {
          (clonedMain as HTMLElement).style.backgroundColor = '#ffffff';
        }
      },
    });
    
    // Restore original padding and margins
    (mainContent as HTMLElement).style.paddingTop = originalPaddingTop;
    (mainContent as HTMLElement).style.paddingBottom = originalPaddingBottom;
    (mainContent as HTMLElement).style.marginBottom = originalMarginBottom;
    if (childDiv) {
      (childDiv as HTMLElement).style.paddingBottom = originalChildPadding;
      (childDiv as HTMLElement).style.marginBottom = originalChildMargin;
    }
    
    // Add new page and title with more top padding
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text(pageTitle, 2, 10);
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Split into multiple pages if content is too tall
    const maxHeightPerPage = pdfHeight - 30; // Adjusted for less space
    const contentStartY = 18; // Reduced gap between title and content
    
    if (imgHeight <= maxHeightPerPage) {
      const imgData = canvas.toDataURL('image/jpeg', 0.90);
      pdf.addImage(imgData, 'JPEG', 0, contentStartY, imgWidth, imgHeight);
    } else {
      const pdfHeightPerPage = maxHeightPerPage;
      const canvasHeightPerPage = (pdfHeightPerPage * canvas.width) / imgWidth;
      const numPages = Math.ceil(canvas.height / canvasHeightPerPage);
      
      for (let i = 0; i < numPages; i++) {
        if (i > 0) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.text(`${pageTitle} (${i + 1}/${numPages})`, 2, 10);
        }
        
        const sourceY = i * canvasHeightPerPage;
        const sourceHeight = Math.min(canvasHeightPerPage, canvas.height - sourceY);
        const sliceImgHeight = (sourceHeight * imgWidth) / canvas.width;
        
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const sliceCtx = sliceCanvas.getContext('2d');
        
          if (sliceCtx) {
            sliceCtx.fillStyle = '#ffffff';
            sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          
          sliceCtx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );
          
          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.90);
          pdf.addImage(sliceData, 'JPEG', 0, contentStartY, imgWidth, sliceImgHeight);
        }
      }
    }
    
    // Remove progress message
    if (document.body.contains(progressDiv)) {
      document.body.removeChild(progressDiv);
    }
    
    // Save the PDF with page-specific filename
    const pageSlug = pageTitle.replace(/\s+/g, '-').toLowerCase();
    const filename = `${tenantName.replace(/\s+/g, '-').toLowerCase()}-${pageSlug}.pdf`;
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating dashboard PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    alert(`Failed to generate dashboard PDF: ${errorMessage}`);
    
    // Clean up progress message if it exists
    const progressDiv = document.querySelector('[style*="z-index: 99999"]');
    if (progressDiv) {
      progressDiv.remove();
    }
  }
}