export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export const STOCK_STATUS_OPTIONS = [
    { value: "in_stock", label: "In Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
] as const satisfies readonly { value: StockStatus; label: string }[];

export function stockStatusLabel(status: StockStatus): string {
    return (
        STOCK_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
        status
    );
}
