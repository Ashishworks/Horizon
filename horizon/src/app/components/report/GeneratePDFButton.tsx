"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function GeneratePDFButton() {
    const generatePDF = async () => {
        const pages = document.querySelectorAll(".report-sheet");
        if (!pages.length) return;

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
                        // 1. Target the styles specifically
                        const styleTags = clonedDoc.getElementsByTagName("style");
                        for (let style of styleTags) {
                            // Replace any lab() or oklch() calls with a fallback color (black)
                            // html2canvas fails when it sees these strings in the CSS rules
                            style.innerHTML = style.innerHTML
                                .replace(/lab\([^)]+\)/g, "#000000")
                                .replace(/oklch\([^)]+\)/g, "#000000")
                                .replace(/oklab\([^)]+\)/g, "#000000");
                        }

                        // 2. Apply your "Nuclear" overrides to the cloned document
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
        }
    };

    return (
        <button onClick={generatePDF} className="...">
            Generate PDF
        </button>
    );
}