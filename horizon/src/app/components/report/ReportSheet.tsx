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
import TrendLineCharts2 from "./TrendLineCharts2";
import { useUserDetails } from "@/hooks/useUserDetails";
import UserDetails from "./UserDetails";
import AIOverviewSection from "./AIOverviewSection";


export default function ReportSheet({
    range,
    days,
}: {
    range: ReportRange;
    days: number;
}) {
    const today = new Date().toLocaleDateString();
    const { data, loading, error } = useReportData(days);
    const { userName, userLoading } = useUserDetails();

    if (loading || userLoading) {
        return (
            <div className="bg-white w-[210mm] min-h-[297mm] p-10">
                <p className="text-sm text-gray-500 text-center">Generating report…</p>
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
                    <p className="text-sm text-gray-500 mt-1">See Your Mind Clearly.</p>
                </div>
                <ReportHeader range={range} days={days} />
                <div className="mt-4 space-y-12">
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                    <UserDetails label="Prepared for" name={userName} />
                    </div>
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                        <SnapshotSummary stats={data.snapshot} />
                    </div>
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                    <InsightSummary insights={data.insights} />
                    </div>
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                    <RiskAssessment risk={data.risk} />
                    </div>
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                    <HabitConsistencyTable habits={data.habits} />
                    </div>
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                    <AIOverviewSection days={7} />
                    </div>
                </div>
            </div>

            {/* PAGE 2 */}
            <div className="report-sheet relative pdf-safe bg-white text-black w-[210mm] h-[297mm] p-10 shadow-xl mb-10 mx-auto">
                <div className="space-y-12">
                    <TrendLineCharts trends={data.trends} />
                </div>
            </div>

            <div className="report-sheet relative pdf-safe bg-white text-black w-[210mm] h-[297mm] p-10 shadow-xl mb-10 mx-auto">
                <div className="space-y-12">
                    <TrendLineCharts2 trends={data.trends} />
                </div>
            </div>

            {/* PAGE 3 */}
            <div className="report-sheet relative pdf-safe bg-white text-black w-[210mm] h-[297mm] p-10 shadow-xl mb-10 mx-auto">
                <div className="space-y-12">
                    <div className="pb-6 mb-8 border-b border-gray-200/60">
                    <DayComparison best={data.bestDays} worst={data.worstDays} />
                    </div>
                    <PersonalizedSuggestions suggestions={data.recommendations} />
                </div>
                <footer className="absolute bottom-10 left-10 right-10 text-xs text-gray-500 border-t pt-4 text-center">
                    This report is generated from user-entered journal data with zony's comment.
                </footer>
            </div>
        </div>
    );
}
