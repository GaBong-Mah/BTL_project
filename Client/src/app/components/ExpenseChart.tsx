import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "./ui/card";
import { Transaction } from "./TransactionForm";

interface ExpenseChartProps {
  transactions: Transaction[];
  selectedWalletId: string | null;
}

// Mảng màu sắc đa dạng chống trùng màu
const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", 
  "#06b6d4", "#f43f5e", "#84cc16", "#d946ef", "#6366f1"
];

export function ExpenseChart({ transactions, selectedWalletId }: ExpenseChartProps) {
  // 1. Lọc giao dịch theo ví
  const filtered = selectedWalletId
    ? transactions.filter((t) => String(t.walletId) === String(selectedWalletId))
    : transactions;

  // 2. Gom nhóm dữ liệu theo danh mục
  const processData = (type: "income" | "expense") => {
    return filtered
      .filter((t) => t.type === type)
      .reduce((acc, t) => {
        const name = t.category || "Khác";
        const existing = acc.find((item) => item.name === name);
        const val = Math.abs(Number(t.amount)); 
        
        if (existing) {
          existing.value += val;
        } else {
          acc.push({ name, value: val });
        }
        return acc;
      }, [] as { name: string; value: number }[]);
  };

  const expenseData = processData("expense");
  const incomeData = processData("income");

  const renderSection = (data: any[], title: string, emptyLabel: string) => (
    <Card className="p-4 bg-gray-50/50 border-none shadow-none">
      <h4 className="text-md font-semibold mb-4 text-center text-gray-600 uppercase tracking-wider">{title}</h4>
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
          {emptyLabel}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              // Hiển thị Tên: %
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} // ÉP MÀU RIÊNG CHO TỪNG CELL
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(val: number) => val.toLocaleString("vi-VN") + " đ"}
            />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {renderSection(expenseData, "Phân bổ Chi Tiêu", "Chưa có dữ liệu chi tiêu")}
      {renderSection(incomeData, "Cơ cấu Thu Nhập", "Chưa có dữ liệu thu nhập")}
    </div>
  );
}