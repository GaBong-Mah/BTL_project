const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'manh2005', // Đảm bảo đúng mật khẩu MySQL của bạn
    database: 'QuanLiChiTieu'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
        return;
    }
    console.log('✅ Đã kết nối MySQL thành công!');
});

// 1. Lấy danh sách ví
app.get('/api/wallets', (req, res) => {
    db.query('SELECT wallet_id as id, wallet_name as name, balance FROM Wallets', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Lấy danh sách giao dịch (JOIN để lấy tên danh mục cho biểu đồ)
app.get('/api/transactions', (req, res) => {
    const sql = `
        SELECT t.transaction_id, t.wallet_id, t.amount, t.note, t.transaction_date, 
               c.category_name, c.category_type 
        FROM Transactions t 
        LEFT JOIN Categories c ON t.category_id = c.category_id 
        ORDER BY t.transaction_date DESC, t.transaction_id DESC`;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Thêm ví mới
app.post('/api/wallets', (req, res) => {
    const { name, balance } = req.body;
    if (!name) return res.status(400).json({ error: "Tên ví không được để trống" });

    const sql = "INSERT INTO Wallets (wallet_name, balance) VALUES (?, ?)";
    db.query(sql, [name, Number(balance) || 0], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// 4. Xóa ví
app.delete('/api/wallets/:id', (req, res) => {
    const walletId = req.params.id;
    db.query('DELETE FROM Wallets WHERE wallet_id = ?', [walletId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 5. Thêm giao dịch & Cập nhật số dư ví
app.post('/api/transactions', (req, res) => {
    const { wallet_id, category_id, amount, type, note } = req.body;
    
    if (!wallet_id || !category_id || !amount) {
        return res.status(400).json({ error: "Thiếu thông tin giao dịch" });
    }

    // Nếu là chi tiêu (expense) thì trừ tiền (-), thu nhập (income) thì cộng tiền (+)
    const numAmount = (type === 'income') ? Number(amount) : -Number(amount);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);

        // B1: Cập nhật số dư trong ví
        db.query('UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?', [numAmount, wallet_id], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => res.status(400).json({ error: "Lỗi: Ví không tồn tại" }));
            }

            // B2: Lưu bản ghi giao dịch (Luôn lưu số dương vào cột amount)
            const sqlIn = "INSERT INTO Transactions (wallet_id, category_id, amount, note) VALUES (?, ?, ?, ?)";
            db.query(sqlIn, [wallet_id, category_id, Math.abs(Number(amount)), note || ""], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi lưu giao dịch" }));
                
                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    res.json({ success: true });
                });
            });
        });
    });
});

// 6. Chuyển tiền giữa 2 ví
app.post('/api/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;
    const numAmount = Number(amount);

    if (!fromId || !toId || numAmount <= 0) {
        return res.status(400).json({ error: "Thông tin chuyển khoản không hợp lệ" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);

        // Trừ tiền ví gửi
        db.query('UPDATE Wallets SET balance = balance - ? WHERE wallet_id = ?', [numAmount, fromId], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi trừ tiền ví gửi" }));

            // Cộng tiền ví nhận
            db.query('UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?', [numAmount, toId], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi cộng tiền ví nhận" }));
                
                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    res.json({ success: true });
                });
            });
        });
    });
});

// 7. Xóa giao dịch & Hoàn lại tiền vào ví
app.delete('/api/transactions/:id', (req, res) => {
    const tId = req.params.id;
    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);

        const selectSql = `
            SELECT t.amount, t.wallet_id, c.category_type 
            FROM Transactions t 
            JOIN Categories c ON t.category_id = c.category_id 
            WHERE t.transaction_id = ?`;

        db.query(selectSql, [tId], (err, results) => {
            if (err || results.length === 0) {
                return db.rollback(() => res.status(404).json({ error: "Không thấy giao dịch" }));
            }

            const { amount, wallet_id, category_type } = results[0];
            
            const refund = (category_type === 'expense') ? Number(amount) : -Number(amount);

            db.query('UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?', [refund, wallet_id], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi hoàn tiền ví" }));

                db.query('DELETE FROM Transactions WHERE transaction_id = ?', [tId], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi xóa bản ghi" }));
                    
                    db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).json(err));
                        res.json({ success: true });
                    });
                });
            });
        });
    });
});

app.listen(5000, () => console.log(`🚀 Server đang chạy tại http://localhost:5000`));