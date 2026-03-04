import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export interface WalletType {
  id: string;
  name: string;
  balance: number;
  icon: string;
}

interface WalletManagerProps {
  wallets: WalletType[];
  onAddWallet: (wallet: Omit<WalletType, "id">) => void;
  onDeleteWallet: (id: string) => void;
  selectedWalletId: string | null;
  onSelectWallet: (id: string | null) => void;
}

const WALLET_ICONS = ["💰", "💳", "🏦", "👛", "💵", "🪙"];

export function WalletManager({
  wallets,
  onAddWallet,
  onDeleteWallet,
  selectedWalletId,
  onSelectWallet,
}: WalletManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [icon, setIcon] = useState(WALLET_ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialBalance) return;

    onAddWallet({
      name,
      balance: parseFloat(initialBalance),
      icon,
    });

    setName("");
    setInitialBalance("");
    setIcon(WALLET_ICONS[0]);
    setIsOpen(false);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Ví Của Tôi</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Ví
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Ví Mới</DialogTitle>
              <DialogDescription>
                Tạo ví mới để quản lý tiền của bạn
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="wallet-name">Tên ví</Label>
                <Input
                  id="wallet-name"
                  placeholder="Ví dụ: Ví Tiền Mặt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="initial-balance">Số dư ban đầu (VNĐ)</Label>
                <Input
                  id="initial-balance"
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <Label>Biểu tượng</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {WALLET_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`text-2xl p-2 rounded border-2 hover:bg-gray-100 ${
                        icon === emoji ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Tạo Ví
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Label>Chọn ví để xem</Label>
        <Select
          value={selectedWalletId || "all"}
          onValueChange={(value) => onSelectWallet(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ví</SelectItem>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.icon} {wallet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">Tổng Số Dư</span>
          </div>
          <p className="text-3xl font-bold">
            {totalBalance.toLocaleString("vi-VN")} đ
          </p>
        </div>

        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <p className="font-medium">{wallet.name}</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {wallet.balance.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
              {wallets.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteWallet(wallet.id)}
                  className="text-red-500"
                >
                  Xóa
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}