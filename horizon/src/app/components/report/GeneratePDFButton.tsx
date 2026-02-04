"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function GeneratePDFButton() {
    const generatePDF = async () => {
        const element = document.getElementById("report-sheet");
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // 1. Inject a "Safety" Style Tag
                    // This is the nuclear option: it overrides all OKLCH/LAB in the CSS
                    const style = clonedDoc.createElement("style");
                    style.innerHTML = `
                        * {
                            color: #000000 !important;
                            border-color: #e5e7eb !important;
                            background-color: transparent !important;
                            box-shadow: none !important;
                            text-shadow: none !important;
                        }
                        #report-sheet {
                            background-color: #ffffff !important;
                        }
                        svg, svg * {
                            stroke: #374151 !important;
                            fill: none !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);

                    // 2. Ensure the ID matches the capture target
                    const clonedElement = clonedDoc.getElementById("report-sheet");
                    if (clonedElement) {
                        clonedElement.style.display = "block";
                    }
                },
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save("Horizon_Report.pdf");
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        }
    };

    return (
        <button
            onClick={generatePDF}
            className="px-5 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
            Generate PDF
        </button>
    );
}