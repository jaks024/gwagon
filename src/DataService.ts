import { DateSortMode } from "./models/DateSortMode";
import { EntrySortMode } from "./models/EntrySortMode";
import { IEntry } from "./models/IEntry";
import { ISummary } from "./models/ISummary";

export function DataService() {
    const summarize = (entries: IEntry[]): ISummary => {
        const summary: ISummary = {
            incomeTotal: 0,
            incomeAverage: 0,
            expenseTotal: 0,
            expenseAverage: 0,
            numOfEntires: entries.length
        };
        
        entries.forEach(entry => {
            if (entry.isExpense) {
                summary.expenseTotal += entry.amount;
            } else {
                summary.incomeTotal += entry.amount;
            }
        });
        
        summary.incomeAverage = summary.incomeTotal / entries.length;
        summary.expenseTotal = summary.expenseTotal / entries.length;
        
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