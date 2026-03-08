import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
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
import { WalletType } from "./WalletManager";

export interface TransferRecord {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note: string;
  date: string;
}

interface TransferMoneyProps {
  wallets: WalletType[];
  onTransfer: (transfer: TransferRecord) => void;
}

export function TransferMoney({ wallets, onTransfer }: TransferMoneyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fromWallet, setFromWallet] = useState("");
  const [toWallet, setToWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromWallet || !toWallet || !amount || fromWallet === toWallet) {
      return;
    }

    const transferRecord: TransferRecord = {
      id: Date.now().toString(),
      fromWalletId: fromWallet,
      toWalletId: toWallet,
      amount: parseFloat(amount),
      note: note || "Chuyển tiền giữa các ví",
      date: new Date().toISOString().split("T")[0],
    };

    onTransfer(transferRecord);

    // Reset form
    setFromWallet("");
    setToWallet("");
    setAmount("");
    setNote("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Chuyển Tiền Giữa Ví
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển Tiền</DialogTitle>
          <DialogDescription>
            Chuyển tiền giữa các ví của bạn
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="from-wallet">Từ ví</Label>
            <Select value={fromWallet} onValueChange={setFromWallet}>
              <SelectTrigger id="from-wallet">
                <SelectValue placeholder="Chọn ví nguồn" />
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
            <Label htmlFor="to-wallet">Đến ví</Label>
            <Select value={toWallet} onValueChange={setToWallet}>
              <SelectTrigger id="to-wallet">
                <SelectValue placeholder="Chọn ví đích" />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter((w) => w.id !== fromWallet)
                  .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.icon} {wallet.name} ({wallet.balance.toLocaleString("vi-VN")} đ)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transfer-amount">Số tiền (VNĐ)</Label>
            <Input
              id="transfer-amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1000"
            />
          </div>

          <div>
            <Label htmlFor="transfer-note">Ghi chú (không bắt buộc)</Label>
            <Input
              id="transfer-note"
              type="text"
              placeholder="Ví dụ: Rút tiền ATM"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Xác Nhận Chuyển
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}