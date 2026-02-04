import { ReportRange } from "@/app/report/page";

export default function ReportHeader({
    range,
    days,
}: {
    range: ReportRange;
    days: number;
}) {
    

    const labelMap: Record<ReportRange, string> = {
        "1m": "Last 1 month",
        "3m": "Last 3 months",
        "6m": "Last 6 months",
        "1y": "Last 1 year",
    };

    return (
        <div className="border-b pb-4">
            <h2 className="text-xl font-bold">Mental Health Report</h2>

            <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Period: {labelMap[range]}</span>
            </div>
        </div>
    );
}
