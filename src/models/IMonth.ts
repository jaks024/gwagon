import { IDay } from "./IDay";

export interface IMonth {
    year: number;
    month: number;
    daysData: IDay[];
}
