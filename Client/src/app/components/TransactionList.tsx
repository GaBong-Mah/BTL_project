import { Transaction } from '../models/Transaction';
interface TransactionListProps {
    transactions: any[];
    onDeleteTransaction: (id: string) => void;
    transfers?: any[];
    wallets?: any[];
    onDeleteTransfer?: (id: string) => void;
    onEditTransaction?: (id: string, updated: any) => void;
}

export const TransactionList = ({ transactions, onDeleteTransaction }: TransactionListProps) => {
    return (
        <div className="transaction-container" style={{ padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                Lịch sử giao dịch
            </h3>
            
            {transactions.length > 0 ? (
                <div className="space-y-3">
                    {transactions.map((item, index) => (
                        <div key={index} style={{
                            padding: '12px', border: '1px solid #eee', borderRadius: '8px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
                        }}>
                            <div>
                                <p style={{ fontWeight: 'bold', margin: 0 }}>{item.description || item.note}</p>
                                <small style={{ color: '#888' }}>{item.category}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ 
                                    color: item.type === 'income' ? '#28a745' : '#d32f2f', 
                                    fontWeight: 'bold', margin: 0 
                                }}>
                                    {item.type === 'income' ? '+' : '-'}{Number(item.amount).toLocaleString()}đ
                                </p>
                                <button 
                                    onClick={() => onDeleteTransaction(item.id)}
                                    style={{ color: '#ff4d4f', fontSize: '12px', cursor: 'pointer', border: 'none', background: 'none' }}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    Chưa có giao dịch nào.
                </div>
            )}
        </div>
    );
};