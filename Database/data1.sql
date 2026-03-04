USE QuanLiChiTieu;
ALTER TABLE Transactions DROP FOREIGN KEY transactions_ibfk_1;
ALTER TABLE Wallets MODIFY COLUMN wallet_id VARCHAR(50);
ALTER TABLE Transactions MODIFY COLUMN wallet_id VARCHAR(50);
ALTER TABLE Transactions ADD CONSTRAINT fk_wallet_id 
FOREIGN KEY (wallet_id) REFERENCES Wallets(wallet_id) ON DELETE CASCADE;
INSERT IGNORE INTO Wallets (wallet_id, wallet_name, balance) VALUES ('1', 'Ví Mô Phỏng', 10000000);