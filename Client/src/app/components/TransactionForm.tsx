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
  categoryId: number; // Thêm trường này để gửi về server
  amount: number;
  description: string;
  date: string;
  walletId: string;
}

interface TransactionFormProps {
  wallets: WalletType[];
  onAddTransaction: (transaction: any) => void;
}

// Khai báo danh mục kèm ID đúng với Database của bạn
const EXPENSE_CATEGORIES = [
  { id: 1, name: "Ăn uống" },
  { id: 2, name: "Di chuyển" },
  { id: 3, name: "Mua sắm" },
  { id: 4, name: "Giải trí" },
  { id: 5, name: "Sức khỏe" },
  { id: 6, name: "Học tập" },
  { id: 7, name: "Tiền nhà" },
  { id: 8, name: "Hóa đơn" },
  { id: 9, name: "Khác" },
];

const INCOME_CATEGORIES = [
  { id: 10, name: "Lương" },
  { id: 11, name: "Thưởng" },
  { id: 12, name: "Đầu tư" },
  { id: 13, name: "Bán hàng" },
  { id: 14, name: "Khác" },
];

export function TransactionForm({ wallets, onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [selectedCatId, setSelectedCatId] = useState<string>(""); // Lưu ID dưới dạng string cho Select
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [walletId, setWalletId] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCatId || !amount || !walletId) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Tìm tên danh mục dựa trên ID đã chọn
    const categoryObj = categories.find(c => String(c.id) === selectedCatId);

    const transaction = {
      type,
      categoryId: Number(selectedCatId), // Gửi ID số về Server
      category: categoryObj?.name || "Khác",
      amount: parseFloat(amount),
      description: description || categoryObj?.name || "",
      walletId,
    };

    onAddTransaction(transaction);
    
    // Reset form
    setSelectedCatId("");
    setAmount("");
    setDescription("");
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
                setSelectedCatId("");
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
                setSelectedCatId("");
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
                  {wallet.name} ({Number(wallet.balance).toLocaleString("vi-VN")} đ)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Danh mục</Label>
          <Select value={selectedCatId} onValueChange={setSelectedCatId}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
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
          />
        </div>

        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Input
            id="description"
            type="text"
            placeholder="Ví dụ: Mua trà sữa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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