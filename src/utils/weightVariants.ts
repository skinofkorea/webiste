export interface WeightVariant {
    id: string;
    label: string;
    name?: string;
    weightKg: number;
    mrp: number;
    salePrice: number;
    price?: number;
    stock: number; // individual stock for this variant
    inStock?: boolean; // undefined = in stock (default), false = out of stock
    // Optional bulk pricing and minimum order quantity
    bulkPrice?: number;
    bulkMOQ?: number;
    // Optional pack descriptor (e.g., "Pack of 4")
    pack?: string;
}

export const DEFAULT_WEIGHT_VARIANTS: WeightVariant[] = [
    { id: '1kg', label: '1 kg', weightKg: 1, mrp: 250, salePrice: 199, stock: 0 },
    { id: '5kg', label: '5 kg', weightKg: 5, mrp: 950, salePrice: 799, stock: 0 },
    { id: '10kg', label: '10 kg', weightKg: 10, mrp: 1799, salePrice: 1499, stock: 0 },
    { id: '25kg', label: '25 kg', weightKg: 25, mrp: 3975, salePrice: 3475, stock: 0 },
];

