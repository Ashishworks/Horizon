"use client";

import html2pdf from "html2pdf.js";

export default function GeneratePDFButton() {

    const generatePDF = () => {
        const element = document.getElementById("report-sheet");
        if (!element) return;

        html2pdf()
            .set({
                filename: "Horizon_Report.pdf",

                html2canvas: {
                    scale: 2,
                    backgroundColor: "#ffffff",

                    onclone: (doc: Document) => {
                        const root = doc.getElementById("report-sheet");
                        if (!root) return;

                        const win = doc.defaultView;
                        if (!win) return;

                        root.querySelectorAll("*").forEach((el) => {
                            const node = el as HTMLElement;
                            const cs = win.getComputedStyle(node);

                            /* ---------- TEXT ---------- */
                            if (cs.color.includes("oklch") || cs.color.includes("lab")) {
                                node.style.color = "rgb(0,0,0)";
                            }

                            /* ---------- BACKGROUNDS ---------- */
                            if (
                                cs.background.includes("oklch") ||
                                cs.background.includes("lab") ||
                                cs.backgroundImage !== "none"
                            ) {
                                node.style.background = "transparent";
                                node.style.backgroundColor = "transparent";
                                node.style.backgroundImage = "none";
                            }

                            /* ---------- BORDERS (ALL SIDES) ---------- */
                            if (
                                cs.borderTopColor.includes("oklch") ||
                                cs.borderRightColor.includes("oklch") ||
                                cs.borderBottomColor.includes("oklch") ||
                                cs.borderLeftColor.includes("oklch") ||
                                cs.borderTopColor.includes("lab")
                            ) {
                                node.style.borderColor = "rgb(229,231,235)";
                            }

                            /* ---------- OUTLINE ---------- */
                            if (cs.outlineColor.includes("oklch") || cs.outlineColor.includes("lab")) {
                                node.style.outline = "none";
                            }

                            /* ---------- SVG COLORS (CRITICAL) ---------- */
                            if (node instanceof SVGElement) {
                                node.setAttribute("fill", "rgb(0,0,0)");
                                node.setAttribute("stroke", "none");
                                node.setAttribute("stop-color", "rgb(0,0,0)");
                            }
                            if (
                                cs.background.includes("lab") ||
                                cs.background.includes("oklch")
                            ) {
                                console.warn("LAB FOUND:", node, cs.background);
                            }

                            /* ---------- KILL EFFECTS ---------- */
                            node.style.boxShadow = "none";
                            node.style.textShadow = "none";
                            node.style.filter = "none";
                            node.style.animation = "none";
                            node.style.transition = "none";
                        });
                    },

                },

                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait",
                },
            })
            .from(element)
            .save();
    };

    return (
        <button
            onClick={generatePDF}
            className="px-5 py-2 rounded-md bg-primary text-primary-foreground"
        >
            Generate PDF
        </button>
    );
}
