const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'manh2005', 
    database: 'QuanLiChiTieu' 
});

db.connect((err) => {
    if (err) return console.error('Lỗi MySQL:', err.message);
    console.log('Đã kết nối MySQL thành công!');
});

// 1. API Lấy danh sách ví (Để React không bị lấy dữ liệu ảo)
app.get('/api/wallets', (req, res) => {
    db.query('SELECT wallet_id as id, wallet_name as name, balance FROM Wallets', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 2. API Tạo ví mới (Xử lý lỗi image_6fd3a2.jpg)
app.post('/api/wallets', (req, res) => {
    const { id, name, balance } = req.body;
    const sql = "INSERT INTO Wallets (wallet_id, wallet_name, balance) VALUES (?, ?, ?)";
    db.query(sql, [id, name, balance || 0], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// 3. API Thêm giao dịch (Giữ nguyên logic của bạn nhưng thêm log)
app.post('/api/transactions', (req, res) => {
    const { wallet_id, category_id, amount, type, note } = req.body;
    const numAmount = (type === 'income') ? Number(amount) : -Number(amount);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);
        
        // Cập nhật số dư ví
        db.query('UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?', [numAmount, wallet_id], (err, result) => {
            if (err || result.affectedRows === 0) {
                return db.rollback(() => res.status(400).json({ error: "Ví không tồn tại!" }));
            }
            // Lưu lịch sử
            const sqlIn = "INSERT INTO Transactions (wallet_id, category_id, amount, note) VALUES (?, ?, ?, ?)";
            db.query(sqlIn, [wallet_id, category_id, Math.abs(numAmount), note], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));
                db.commit(() => res.json({ success: true }));
            });
        });
    });
});

app.listen(5000, () => console.log(`Server chạy tại port 5000`));