import axios from "axios";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { StatisticsCard } from "./components/StatisticsCard";
import { TransactionForm, Transaction } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { ExpenseChart } from "./components/ExpenseChart";
import { WalletManager, WalletType } from "./components/WalletManager";
import { TransferMoney, TransferRecord } from "./components/TransferMoney";

export default function App() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // 1. Lấy dữ liệu từ Server
  const refreshData = async () => {
    try {
      const resWallets = await axios.get("http://localhost:5000/api/wallets");
      if (resWallets.data) {
        const mappedWallets = resWallets.data.map((w: any) => ({
          id: String(w.id),
          name: w.name,
          balance: Number(w.balance)
        }));
        setWallets(mappedWallets);
      }

      const resTrans = await axios.get("http://localhost:5000/api/transactions");
      if (resTrans.data) {
        const mappedTrans = resTrans.data.map((item: any) => ({
          id: String(item.transaction_id),
          walletId: String(item.wallet_id),
          amount: Number(item.amount),
          type: item.category_type === "income" ? "income" : "expense",
          // Lấy category_name để ExpenseChart có thể nhóm dữ liệu chính xác
          category: item.category_name || "Chưa phân loại",
          description: item.note || "",
          date: item.transaction_date,
        }));
        setTransactions(mappedTrans);
      }
    } catch (err) {
      console.error("Lỗi kết nối Server:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 2. Thêm Ví
  const handleAddWallet = async (walletData: any) => {
    try {
      const res = await axios.post("http://localhost:5000/api/wallets", {
        name: walletData.name,
        balance: Number(walletData.balance)
      });
      if (res.data.success) {
        await refreshData();
        alert("Thêm ví mới thành công!");
      }
    } catch (err) {
      alert("Lỗi khi thêm ví!");
    }
  };

  // 3. Thêm Giao Dịch
  const handleAddTransaction = async (transaction: any) => {
    try {
      // Ưu tiên categoryId từ Form, nếu không có mới dùng mặc định theo type
      const catId = transaction.categoryId || (transaction.type === 'income' ? 10 : 1);

      const res = await axios.post("http://localhost:5000/api/transactions", {
        wallet_id: Number(transaction.walletId),
        category_id: Number(catId), 
        amount: Number(transaction.amount),
        note: transaction.description || "Giao dịch mới",
        type: transaction.type
      });

      if (res.data.success) {
        await refreshData();
        alert("Thêm giao dịch thành công!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi: Không thể thêm giao dịch. Hãy kiểm tra lại danh mục và ví.");
    }
  };

  // 4. Chuyển Tiền
  const handleTransfer = async (transfer: TransferRecord) => {
    try {
      const res = await axios.post("http://localhost:5000/api/transfer", {
        fromId: Number(transfer.fromWalletId),
        toId: Number(transfer.toWalletId),
        amount: Number(transfer.amount)
      });
      if (res.data.success) {
        await refreshData();
        alert("Chuyển khoản thành công!");
      }
    } catch (err) {
      alert("Lỗi khi chuyển tiền!");
    }
  };

  // 5. Xóa Ví
  const handleDeleteWallet = async (walletId: string) => {
    if (!window.confirm("Xóa ví sẽ xóa sạch giao dịch liên quan. Bạn chắc chứ?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/wallets/${walletId}`);
      if (res.data.success) {
        await refreshData();
        if (selectedWalletId === walletId) setSelectedWalletId(null);
        alert("Đã xóa ví!");
      }
    } catch (err) {
      alert("Lỗi xóa ví!");
    }
  };

  // 6. Xóa Giao Dịch
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm("Xóa giao dịch này? Số dư ví sẽ được tự động hoàn lại.")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      if (res.data.success) {
        await refreshData();
        alert("Đã xóa giao dịch thành công!");
      }
    } catch (err) {
      alert("Lỗi xóa giao dịch!");
    }
  };

  // Logic lọc và tính toán
  const filteredTransactions = selectedWalletId
    ? transactions.filter((t) => String(t.walletId) === String(selectedWalletId))
    : transactions;

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = selectedWalletId
    ? Number(wallets.find((w) => String(w.id) === String(selectedWalletId))?.balance || 0)
    : wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Chi Tiêu Cá Nhân</h1>
            <p className="text-gray-600">Dữ liệu thời gian thực: Node.js + MySQL</p>
          </div>
          <div className="text-right text-sm text-blue-600 font-mono font-bold">
            Status: Connected to Database
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatisticsCard title="Tổng Thu Nhập" amount={totalIncome} icon={TrendingUp} variant="income" />
          <StatisticsCard title="Tổng Chi Tiêu" amount={totalExpense} icon={TrendingDown} variant="expense" />
          <StatisticsCard title={selectedWalletId ? "Số Dư Ví" : "Tổng Số Dư"} amount={balance} icon={Wallet} variant="balance" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <WalletManager
              wallets={wallets}
              onAddWallet={handleAddWallet}
              onDeleteWallet={handleDeleteWallet}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
            />
            {wallets.length >= 2 && <TransferMoney wallets={wallets} onTransfer={handleTransfer} />}
          </div>
          
          <TransactionForm wallets={wallets} onAddTransaction={handleAddTransaction} />
          
          <TransactionList
            transactions={filteredTransactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">📊 Phân tích tài chính</h3>
          <ExpenseChart transactions={transactions} selectedWalletId={selectedWalletId} />
        </div>
      </div>
    </div>
  );
}