export class Transaction {
    private id: number;
    private note: string;
    private amount: number;
    private category: string;
    private date: Date;

    constructor(id: any, note: any, amount: any, category: any, date: any) {
        // Ép kiểu để dù DB trả về kiểu gì cũng không chết code
        this.id = Number(id) || 0;
        this.note = String(note || "Giao dịch không tên");
        this.amount = Number(amount) || 0;
        this.category = String(category || "Chưa phân loại");
        
        // Kiểm tra ngày tháng kỹ lưỡng
        const parsedDate = new Date(date);
        this.date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }

    public getId(): number { return this.id; }
    public getNote(): string { return this.note; }
    public getAmount(): number { return this.amount; }
    public getCategory(): string { return this.category; }

    public getFormattedAmount(): string {
        // Nếu amount âm, vẫn format đúng chuẩn VND
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(Math.abs(this.amount));
    }

    public getFormattedDate(): string {
        return this.date.toLocaleDateString('vi-VN');
    }
}