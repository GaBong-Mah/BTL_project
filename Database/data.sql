DROP DATABASE IF EXISTS QuanLiChiTieu;
CREATE DATABASE QuanLiChiTieu;
use QuanLiChiTieu;
CREATE TABLE Wallets(
wallet_id int auto_increment primary key,
wallet_name varchar(100) NOT NULL,
balance decimal(15,2) default 0   
);
CREATE TABLE Categories(
category_id int auto_increment primary key,
category_name varchar(100) NOT NULL,
category_type ENUM('income', 'expense') NOT NULL
); 
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT,
    category_id INT,
    amount DECIMAL(15, 2) NOT NULL,
    note TEXT,
    transaction_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (wallet_id) REFERENCES Wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);
SET FOREIGN_KEY_CHECKS = 0;
-- Tạo 1 cái ví chuẩn ID = 1
INSERT INTO Wallets (wallet_id, wallet_name, balance) 
VALUES (1, 'Ví Mô Phỏng', 10000000)
ON DUPLICATE KEY UPDATE wallet_name='Ví Mô Phỏng', balance=10000000;

-- Tạo 1 danh mục chuẩn ID = 1
INSERT INTO Categories (category_id, category_name, category_type) 
VALUES (1, 'Chi tiêu chung', 'expense')
ON DUPLICATE KEY UPDATE category_name='Chi tiêu chung';
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO Transactions (wallet_id, category_id, amount, note, transaction_date) 
VALUES (1, 1, 20000, 'Test kết nối chuẩn', CURRENT_DATE);
SELECT * FROM Transactions;