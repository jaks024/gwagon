import { IEntry } from "./IEntry";

export interface IDay {
    year: number;
    month: number;
    day: number;
    entries: IEntry[];
}
