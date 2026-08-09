import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    accent?: "primary" | "green" | "amber" | "red" | "muted";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
    muted: "bg-surface-2 text-text-muted",
};

export default function StatCard({ label, value, icon: Icon, accent = "muted" }: StatCardProps) {
    return (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accentClasses[accent]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-text leading-tight">{value.toLocaleString()}</p>
                <p className="text-xs text-text-muted truncate">{label}</p>
            </div>
        </div>
    );
}