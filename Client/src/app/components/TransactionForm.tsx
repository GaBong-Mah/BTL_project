import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { WalletType } from "./WalletManager";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  walletId: string;
}

interface TransactionFormProps {
  wallets: WalletType[];
  onAddTransaction: (transaction: Transaction) => void;
}

const EXPENSE_CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Mua sắm",
  "Giải trí",
  "Sức khỏe",
  "Học tập",
  "Tiền nhà",
  "Hóa đơn",
  "Khác",
];

const INCOME_CATEGORIES = [
  "Lương",
  "Thưởng",
  "Đầu tư",
  "Bán hàng",
  "Khác",
];

export function TransactionForm({ wallets, onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [walletId, setWalletId] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || !walletId) {
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      category,
      amount: parseFloat(amount),
      description: description || category, // Nếu không nhập mô tả, dùng tên danh mục
      date,
      walletId,
    };

    onAddTransaction(transaction);
    
    // Reset form
    setCategory("");
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Thêm Giao Dịch</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Loại giao dịch</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
              className={type === "expense" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Chi tiêu
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income");
                setCategory("");
              }}
              className={type === "income" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Thu nhập
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="wallet">Ví</Label>
          <Select value={walletId} onValueChange={setWalletId}>
            <SelectTrigger id="wallet">
              <SelectValue placeholder="Chọn ví" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.icon} {wallet.name} ({wallet.balance.toLocaleString("vi-VN")} đ)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Danh mục</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Số tiền (VNĐ)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="1000"
          />
        </div>

        <div>
          <Label htmlFor="description">Mô tả (không bắt buộc)</Label>
          <Input
            id="description"
            type="text"
            placeholder="Nhập mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="date">Ngày</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Thêm giao dịch
        </Button>
      </form>
    </Card>
  );
}