import { DateSortMode } from "./models/DateSortMode";
import { EntrySortMode } from "./models/EntrySortMode";
import { IEntry } from "./models/IEntry";
import { ISummary } from "./models/ISummary";

export function DataService() {

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const summarize = (entries: IEntry[]): ISummary => {

        const summary: ISummary = {
            incomeTotal: 0,
            incomeAverage: 0,
            expenseTotal: 0,
            expenseAverage: 0,
            numOfEntires: entries.length,
            incomeTagSums: null,
            expenseTagSums: null
        };

        const expenseTagSums = new Map();
        const incomeTagSums = new Map();
        const addToTagSums = (map: Map<string, number>, key: string, val: number) => {
            if (!map.has(key)) {
                map.set(key, val);
                return;
            }
            map.set(key, map.get(key) + val);
        }

        let expenseTotal = 0;
        let incomeTotal = 0;
        entries.forEach(entry => {
            const tags = entry.tags.split(" ");
            const curTagSum = entry.isExpense ? expenseTagSums : incomeTagSums;
            tags.forEach(tag => {
                addToTagSums(curTagSum, tag, entry.amount);
            })  
            if (entry.isExpense) {
                expenseTotal += entry.amount;   
            } else {
                incomeTotal += entry.amount;
            }
        });

        summary.expenseTotal = expenseTotal;   
        summary.expenseTagSums = Object.fromEntries(expenseTagSums);
        summary.incomeTotal = incomeTotal;
        summary.incomeTagSums = Object.fromEntries(incomeTagSums);

        const days = entries.length > 0 ? daysInMonth[entries[0].month] : 31;

        summary.incomeAverage = summary.incomeTotal / days;
        summary.expenseAverage = summary.expenseTotal / days;
        
        return summary;
    };
    
    const sortEntiresBy = (entires: IEntry[], sortMode: EntrySortMode, isAscending: boolean) => {
        switch(sortMode) {
            case EntrySortMode.None:
                return entires;
            case EntrySortMode.Amount: {
                if (isAscending) {
                    return entires.sort((a, b) => a.amount - b.amount);
                }
                return entires.sort((a, b) => b.amount - a.amount);
            }
        }
    };

    return {
        SortEntries: sortEntiresBy,
        Summarize: summarize
    };
}