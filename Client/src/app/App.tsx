import axios from "axios";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { StatisticsCard } from "./components/StatisticsCard";
import { TransactionForm, Transaction } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { ExpenseChart } from "./components/ExpenseChart";
import { WalletManager, WalletType } from "./components/WalletManager";
import { TransferMoney, TransferRecord } from "./components/TransferMoney";

const STORAGE_KEY_TRANSACTIONS = "expense-tracker-transactions";
const STORAGE_KEY_WALLETS = "expense-tracker-wallets";
const STORAGE_KEY_TRANSFERS = "expense-tracker-transfers";

export default function App() {
  const [wallets, setWallets] = useState<WalletType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WALLETS);
    if (saved) {
      return JSON.parse(saved);
    }

    return [
      {
        id: "1", 
        name: "Ví Mô Phỏng",
        balance: 10000000,
        icon: "💰",
      },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [transfers, setTransfers] = useState<TransferRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSFERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy ví trước để có ID chuẩn
        const resWallets = await axios.get("http://localhost:5000/api/wallets");
        if (resWallets.data) setWallets(resWallets.data);

        // Sau đó lấy giao dịch
        const resTrans = await axios.get("http://localhost:5000/api/transactions");
        if (resTrans.data) {
          const mapped = resTrans.data.map((item: any) => ({
            id: String(item.transaction_id),
            walletId: String(item.wallet_id),
            amount: Number(item.amount),
            type: item.amount < 0 ? "expense" : "income",
            category: item.category_name || "Chưa phân loại",
            description: item.note || "",
            date: item.transaction_date,
          }));
          setTransactions(mapped);
        }
      } catch (err) {
        console.error("Lỗi kết nối MySQL:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

const handleAddTransaction = async (transaction: Transaction) => {
    try {
      
      const res = await axios.post("http://localhost:5000/api/transactions", {
        wallet_id: transaction.walletId,
        category_id: 1, 
        amount: transaction.amount,
        note: transaction.description || "Giao dịch mới",
        type: transaction.type
      });

      if (res.data.success) {
        
        setTransactions([...transactions, transaction]);

        setWallets((prevWallets) =>
          prevWallets.map((wallet) => {
            if (wallet.id === transaction.walletId) {
              const change = transaction.type === "income" ? transaction.amount : -transaction.amount;
              return { ...wallet, balance: wallet.balance + change };
            }
            return wallet;
          })
        );
        
        alert("Thêm giao dịch thành công vào MySQL!");
      }
    } catch (err) {
      console.error("Lỗi khi lưu giao dịch:", err);
      alert("Lỗi kết nối Server! Dữ liệu chưa được lưu vào MySQL.");
    }
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length === 1) {
      alert("Bạn phải có ít nhất một ví!");
      return;
    }
    
    const hasTransactions = transactions.some((t) => t.walletId === id);
    if (hasTransactions) {
      alert("Không thể xóa ví có giao dịch. Vui lòng xóa giao dịch trước.");
      return;
    }
    setWallets(wallets.filter((w) => w.id !== id));
    if (selectedWalletId === id) {
      setSelectedWalletId(null);
    }
  };
 const handleDeleteTransaction = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);

      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;

      setTransactions(transactions.filter((t) => t.id !== id));

      setWallets((prevWallets) =>
        prevWallets.map((wallet) => {
          if (wallet.id === transaction.walletId) {
            const change = transaction.type === "income" ? -transaction.amount : transaction.amount;
            return { ...wallet, balance: wallet.balance + change };
          }
          return wallet;
        })
      );
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa giao dịch trong Database!");
    }
  };

  const handleEditTransaction = (id: string, updatedTransaction: Transaction) => {
    const oldTransaction = transactions.find((t) => t.id === id);
    if (!oldTransaction) return;

    // Revert old transaction's effect on wallet
    setWallets((prevWallets) =>
      prevWallets.map((wallet) => {
        if (wallet.id === oldTransaction.walletId) {
          const revertChange =
            oldTransaction.type === "income"
              ? -oldTransaction.amount
              : oldTransaction.amount;
          return {
            ...wallet,
            balance: wallet.balance + revertChange,
          };
        }
        return wallet;
      })
    );

    // Apply new transaction's effect on wallet
    setWallets((prevWallets) =>
      prevWallets.map((wallet) => {
        if (wallet.id === updatedTransaction.walletId) {
          const newChange =
            updatedTransaction.type === "income"
              ? updatedTransaction.amount
              : -updatedTransaction.amount;
          return {
            ...wallet,
            balance: wallet.balance + newChange,
          };
        }
        return wallet;
      })
    );

    // Update transaction
    setTransactions(
      transactions.map((t) => (t.id === id ? updatedTransaction : t))
    );
  };

  const handleTransfer = (transfer: TransferRecord) => {
    const fromWallet = wallets.find((w) => w.id === transfer.fromWalletId);
    
    if (!fromWallet || fromWallet.balance < transfer.amount) {
      alert("Số dư ví không đủ để chuyển!");
      return;
    }

    setTransfers([...transfers, transfer]);

    // Update wallet balances
    setWallets((prevWallets) =>
      prevWallets.map((wallet) => {
        if (wallet.id === transfer.fromWalletId) {
          return {
            ...wallet,
            balance: wallet.balance - transfer.amount,
          };
        }
        if (wallet.id === transfer.toWalletId) {
          return {
            ...wallet,
            balance: wallet.balance + transfer.amount,
          };
        }
        return wallet;
      })
    );
  };

  const handleDeleteTransfer = (id: string) => {
    const transfer = transfers.find((t) => t.id === id);
    if (!transfer) return;

    setTransfers(transfers.filter((t) => t.id !== id));

    // Revert wallet balances
    setWallets((prevWallets) =>
      prevWallets.map((wallet) => {
        if (wallet.id === transfer.fromWalletId) {
          return {
            ...wallet,
            balance: wallet.balance + transfer.amount,
          };
        }
        if (wallet.id === transfer.toWalletId) {
          return {
            ...wallet,
            balance: wallet.balance - transfer.amount,
          };
        }
        return wallet;
      })
    );
  };


  const filteredTransactions = selectedWalletId
    ? transactions.filter((t) => t.walletId === selectedWalletId)
    : transactions;

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = selectedWalletId
    ? wallets.find((w) => w.id === selectedWalletId)?.balance || 0
    : wallets.reduce((sum, w) => sum + w.balance, 0);
  const handleAddWallet = async (wallet: Omit<WalletType, "id">) => {
    const newId = Date.now().toString(); // ID dài này giờ đã được MySQL chấp nhận nhờ lệnh ALTER TABLE bạn vừa chạy
    const newWallet: WalletType = {
      ...wallet,
      id: newId,
    };

    try {
      await axios.post("http://localhost:5000/api/wallets", {
        id: newId,
        name: newWallet.name,
        balance: newWallet.balance,
      });

      setWallets([...wallets, newWallet]);
      alert("Đã tạo ví mới và lưu vào MySQL thành công!");
    } catch (err) {
      console.error("Lỗi tạo ví:", err);
      alert("Không thể kết nối Server để tạo ví mới!");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Chi Tiêu Cá Nhân
          </h1>
          <p className="text-gray-600">
            Theo dõi thu chi và quản lý tài chính của bạn với nhiều ví
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatisticsCard
            title="Tổng Thu Nhập"
            amount={totalIncome}
            icon={TrendingUp}
            variant="income"
          />
          <StatisticsCard
            title="Tổng Chi Tiêu"
            amount={totalExpense}
            icon={TrendingDown}
            variant="expense"
          />
          <StatisticsCard
            title={selectedWalletId ? "Số Dư Ví" : "Tổng Số Dư"}
            amount={balance}
            icon={Wallet}
            variant="balance"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-6">
            <WalletManager
              wallets={wallets}
              onAddWallet={handleAddWallet}
              onDeleteWallet={handleDeleteWallet}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
            />
            {wallets.length >= 2 && (
              <TransferMoney wallets={wallets} onTransfer={handleTransfer} />
            )}
          </div>
          <div>
            <TransactionForm
              wallets={wallets}
              onAddTransaction={handleAddTransaction}
            />
          </div>
          <div>
            <TransactionList
              transactions={selectedWalletId 
                ? transactions.filter((t) => t.walletId === selectedWalletId)
                : transactions
              }
              transfers={transfers}
              wallets={wallets}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteTransfer={handleDeleteTransfer}
              onEditTransaction={handleEditTransaction}
            />
          </div>
        </div>

        <ExpenseChart
          transactions={transactions}
          selectedWalletId={selectedWalletId}
        />
      </div>
    </div>
  );
}