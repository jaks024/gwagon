export interface ISummary {
    incomeTotal: number;
    expenseTotal: number;
    incomeAverage: number;
    expenseAverage: number;
    numOfEntires: number;
    incomeTagSums: Map<string, number>;
    expenseTagSums: Map<string, number>;
}
