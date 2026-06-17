import { Card, CardContent } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  change,
  changeType = "positive",
}: StatCardProps) {
  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {change && (
              <p
                className={`mt-2 text-sm ${
                  changeType === "positive"
                    ? "text-green-400"
                    : changeType === "negative"
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
