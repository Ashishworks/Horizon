"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function GeneratePDFButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const pages = document.querySelectorAll(".report-sheet");
    if (!pages.length || isGenerating) return;

    setIsGenerating(true);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    try {
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;

        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          onclone: (clonedDoc) => {
            // Replace unsupported CSS color functions
            const styleTags = clonedDoc.getElementsByTagName("style");
            for (let style of styleTags) {
              style.innerHTML = style.innerHTML
                .replace(/lab\([^)]+\)/g, "#000000")
                .replace(/oklch\([^)]+\)/g, "#000000")
                .replace(/oklab\([^)]+\)/g, "#000000");
            }

            // Force black & white PDF-safe styles
            const forceStyle = clonedDoc.createElement("style");
            forceStyle.innerHTML = `
              * {
                color: #000000 !important;
                border-color: #e5e7eb !important;
                background-color: transparent !important;
                box-shadow: none !important;
              }
              .report-sheet {
                background-color: #ffffff !important;
                display: block !important;
              }
            `;
            clonedDoc.head.appendChild(forceStyle);
          },
        });

        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      }

      pdf.save("Horizon_Report.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="
        group
        relative
        px-8 py-3
        rounded-full
        bg-primary text-primary-foreground
        text-sm font-medium
        shadow-md
        transition-all duration-300
        hover:shadow-lg
        hover:scale-[1.03]
        active:scale-[0.97]
        focus:outline-none
        disabled:opacity-60
        disabled:cursor-not-allowed
      "
    >
      <span className="relative z-10">
        {isGenerating ? "Generating PDF…" : "Generate PDF"}
      </span>

      {/* subtle glow */}
      {!isGenerating && (
        <span
          className="
            absolute inset-0
            rounded-full
            bg-primary/20
            blur-lg
            opacity-0
            transition-opacity duration-300
            group-hover:opacity-100
          "
        />
      )}
    </button>
  );
}
