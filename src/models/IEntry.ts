export interface IEntry {
    id: number;
    year: number;
    month: number;
    day: number;
    vendor: string;
    location: string;
    amount: number;
    isExpense: boolean;
    tags: string;
    notes: string;
}
