import { ITag } from "./ITag";

export interface IEntry {
    id: number;
    vendor: string;
    location: string;
    amount: number;
    isExpense: boolean;
    tags: ITag[];
    notes: string;
}