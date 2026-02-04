"use client";

import { ReportRange } from "@/app/report/page";
import { useReportData } from "@/hooks/useReportData";

import ReportHeader from "./ReportHeader";
import SnapshotSummary from "./SnapshotSummary";
import TrendLineCharts from "./TrendLineCharts";
import InsightSummary from "./InsightSummary";
import RiskAssessment from "./RiskAssessment";
import HabitConsistencyTable from "./HabitConsistencyTable";
import DayComparison from "./DayComparison";
import PersonalizedSuggestions from "./PersonalizedSuggestions";


export default function ReportSheet({
    range,
    days,
}: {
    range: ReportRange;
    days: number;
}) {
    const today = new Date().toLocaleDateString();
    const { data, loading, error } = useReportData(days);
    console.log(data);

    if (loading) {
        return (
            <div className="bg-white w-[210mm] min-h-[297mm] p-10">
                <p className="text-sm text-gray-500">Generating report…</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white w-[210mm] min-h-[297mm] p-10">
                <p className="text-sm text-red-500">
                    Unable to generate report
                </p>
            </div>
        );
    }

    // Inside ReportSheet component
return (
    <div id="report-container">
        {/* PAGE 1 */}
        <div className="report-sheet relative pdf-safe bg-white text-black w-[210mm] h-[297mm] p-10 shadow-xl mb-10 mx-auto">
             <div className="absolute top-6 right-10 text-xs text-gray-500">Compiled on: {today}</div>
             <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight">Horizon</h1>
                <p className="text-sm text-gray-500 mt-1">Mental Health Insights Report</p>
            </div>
            <ReportHeader range={range} days={days} />
            <div className="mt-8 space-y-12">
                <SnapshotSummary stats={data.snapshot} />
                <InsightSummary insights={data.insights} />
                <RiskAssessment risk={data.risk} />
            </div>
        </div>

        {/* PAGE 2 */}
        <div className="report-sheet relative pdf-safe bg-white text-black w-[210mm] h-[297mm] p-10 shadow-xl mb-10 mx-auto">
            <div className="space-y-12">
                <TrendLineCharts trends={data.trends} />
                <HabitConsistencyTable habits={data.habits} />
            </div>
        </div>

        {/* PAGE 3 */}
        <div className="report-sheet relative pdf-safe bg-white text-black w-[210mm] h-[297mm] p-10 shadow-xl mb-10 mx-auto">
             <div className="space-y-12">
                <DayComparison best={data.bestDays} worst={data.worstDays} />
                <PersonalizedSuggestions suggestions={data.recommendations} />
            </div>
            <footer className="absolute bottom-10 left-10 right-10 text-xs text-gray-500 border-t pt-4">
                This report is generated from user-entered journal data...
            </footer>
        </div>
    </div>
);
}
