import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "./ui/card";
import { Transaction } from "./TransactionForm";

interface ExpenseChartProps {
  transactions: Transaction[];
  selectedWalletId: string | null;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
];

export function ExpenseChart({ transactions, selectedWalletId }: ExpenseChartProps) {
  // Filter by selected wallet if applicable
  const filteredTransactions = selectedWalletId
    ? transactions.filter((t) => t.walletId === selectedWalletId)
    : transactions;

  const expenseTransactions = filteredTransactions.filter((t) => t.type === "expense");

  const categoryData = expenseTransactions.reduce((acc, transaction) => {
    const existing = acc.find((item) => item.name === transaction.category);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      acc.push({
        name: transaction.category,
        value: transaction.amount,
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const incomeTransactions = filteredTransactions.filter((t) => t.type === "income");

  const incomeData = incomeTransactions.reduce((acc, transaction) => {
    const existing = acc.find((item) => item.name === transaction.category);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      acc.push({
        name: transaction.category,
        value: transaction.amount,
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Chi Tiêu Theo Danh Mục</h2>
        {categoryData.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có dữ liệu chi tiêu</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString("vi-VN")} đ`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Thu Nhập Theo Danh Mục</h2>
        {incomeData.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có dữ liệu thu nhập</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString("vi-VN")} đ`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}