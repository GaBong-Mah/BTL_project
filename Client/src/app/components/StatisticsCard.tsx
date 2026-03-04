import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface StatisticsCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  variant: "income" | "expense" | "balance";
}

export function StatisticsCard({ title, amount, icon: Icon, variant }: StatisticsCardProps) {
  const colors = {
    income: "text-green-600",
    expense: "text-red-600",
    balance: "text-blue-600",
  };

  const bgColors = {
    income: "bg-green-100",
    expense: "bg-red-100",
    balance: "bg-blue-100",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-semibold ${colors[variant]}`}>
            {amount.toLocaleString("vi-VN")} đ
          </p>
        </div>
        <div className={`${bgColors[variant]} p-3 rounded-full`}>
          <Icon className={`w-6 h-6 ${colors[variant]}`} />
        </div>
      </div>
    </Card>
  );
}
