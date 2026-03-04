# Personal Expense Tracker - Ứng dụng Quản lý Chi tiêu Cá nhân
Đồ án môn học xây dựng ứng dụng quản lý tài chính sử dụng kiến trúc Full-stack.

## 🚀 Công nghệ sử dụng
* **Frontend:** React (TypeScript), Tailwind CSS.
* **Backend:** Node.js, Express.
* **Database:** MySQL.

## 📋 Tính năng chính
* Quản lý danh sách ví (Thêm/Xem số dư thực tế từ MySQL).
* Ghi chép lại lịch sử giao dịch Thu nhập/Chi tiêu.
* Tự động cập nhật số dư ví sau mỗi giao dịch.
* Đồng bộ dữ liệu thời gian thực giữa giao diện và cơ sở dữ liệu.
* Hiển thị biểu đồ tính toán % sau mỗi giao dịch.

## 🛠 Hướng dẫn cài đặt và khởi chạy

### 1. Chuẩn bị
* Tải mã nguồn về máy và giải nén.
* Mở thư mục dự án bằng **Visual Studio Code**.
* Mở **MySQL Workbench**, chạy các lệnh trong file `database/setup_database.sql` để tạo bảng.

### 2. Khởi chạy hệ thống (Bắt buộc chạy cả 2 Terminal)

#### Bước 1: Chạy Backend (Server)
1. Mở một Terminal mới trong VS Code.
2. Di chuyển vào thư mục server: `cd server`
3. Cài đặt thư viện: `npm install`
4. Khởi động server: `node server.js`
(Cửa sổ này phải được giữ nguyên để duy trì kết nối MySQL.)

#### Bước 2: Chạy Frontend (Client)
1. Mở thêm một Terminal thứ hai.
2. Di chuyển vào thư mục client: `cd client`
3. Cài đặt thư viện: `npm install`
4. Khởi động giao diện: `npm run dev`
5. Truy cập vào đường dẫn `http://localhost:5173` để sử dụng ứng dụng.
