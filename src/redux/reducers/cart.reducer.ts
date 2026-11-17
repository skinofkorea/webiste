import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CartReducerIntialState, CartItem, ShippingInfo } from "../../types/api-types";

const defaultShippingInfo: ShippingInfo = {
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'United Kingdom',
    pinCode: '',
    phone: '',
    landmark: '',
    latitude: undefined,
    longitude: undefined,
    deliveryType: 'current_location'
};

export const computeCartTotals = (cartItems: CartItem[], discount: number = 0) => {
    const validItems = Array.isArray(cartItems) ? cartItems : [];
    const subTotal = validItems.reduce((acc, item) => {
        const price = Number(item?.price) || 0;
        const qty = Number(item?.quantity) || 1;
        return acc + price * qty;
    }, 0);
    // Free delivery on orders £35 and above, otherwise £3.75 standard UK delivery
    const shippingCharges = subTotal > 0 && subTotal < 35 ? 3.75 : 0;
    const tax = 0;
    const safeDiscount = Math.min(Math.max(0, Number(discount) || 0), subTotal);
    const total = Math.max(0, subTotal + shippingCharges - safeDiscount);
    return {
        subTotal: Math.round(subTotal * 100) / 100,
        shippingCharges,
        tax,
        discount: safeDiscount,
        total: Math.round(total * 100) / 100,
    };
};

const getStoredCartItems = (): CartItem[] => {
    try {
        const stored = localStorage.getItem('cartItems');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const getStoredDiscount = (): number => {
    try {
        const stored = localStorage.getItem('cartDiscount');
        return stored ? Number(stored) || 0 : 0;
    } catch {
        return 0;
    }
};

const getStoredShippingInfo = (): ShippingInfo => {
    try {
        const stored = localStorage.getItem('shippingInfo');
        return stored ? JSON.parse(stored) : defaultShippingInfo;
    } catch {
        return defaultShippingInfo;
    }
};

const initialCartItems = getStoredCartItems();
const initialDiscount = getStoredDiscount();
const initialTotals = computeCartTotals(initialCartItems, initialDiscount);

const initialState: CartReducerIntialState = {
    loading: false,
    cartItems: initialCartItems,
    subTotal: initialTotals.subTotal,
    tax: initialTotals.tax,
    shippingCharges: initialTotals.shippingCharges,
    discount: initialTotals.discount,
    total: initialTotals.total,
    shippingInfo: getStoredShippingInfo()
};

const saveToLocalStorage = (state: CartReducerIntialState) => {
    try {
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        localStorage.setItem('cartDiscount', JSON.stringify(state.discount));
        localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo));
    } catch (e) {
        console.error('Failed to save cart to localStorage', e);
    }
};

export const cartReducer = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            state.loading = true;

            const cartCurrency = state.cartItems[0]?.currency || 'GBP';
            const itemCurrency = action.payload.currency || 'GBP';
            if (state.cartItems.length > 0 && cartCurrency !== itemCurrency) {
                state.loading = false;
                return;
            }

            const index = state.cartItems.findIndex(item => item.productId === action.payload.productId);

            if (index !== -1) {
                // If the item already exists in the cart, increment its quantity
                // Limit the quantity to the stock available
                state.cartItems[index].quantity = Math.min(state.cartItems[index].quantity + action.payload.quantity, action.payload.stock);
            } else {
                // If the item doesn't exist in the cart, add it
                state.cartItems.push(action.payload);
            }

            const totals = computeCartTotals(state.cartItems, state.discount);
            state.subTotal = totals.subTotal;
            state.shippingCharges = totals.shippingCharges;
            state.tax = totals.tax;
            state.discount = totals.discount;
            state.total = totals.total;

            state.loading = false;
            saveToLocalStorage(state); // Save to localStorage
        },
        removeCartItem: (state, action: PayloadAction<string>) => {
            state.loading = true;
            state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
            const totals = computeCartTotals(state.cartItems, state.discount);
            state.subTotal = totals.subTotal;
            state.shippingCharges = totals.shippingCharges;
            state.tax = totals.tax;
            state.discount = totals.discount;
            state.total = totals.total;
            state.loading = false;
            saveToLocalStorage(state); // Save to localStorage
        },
        incrementCartItem: (state, action: PayloadAction<string>) => {
            const item = state.cartItems.find(item => item.productId === action.payload);
            if (item && item.quantity < item.stock) {
                item.quantity += 1;
                const totals = computeCartTotals(state.cartItems, state.discount);
                state.subTotal = totals.subTotal;
                state.shippingCharges = totals.shippingCharges;
                state.tax = totals.tax;
                state.discount = totals.discount;
                state.total = totals.total;
                saveToLocalStorage(state); // Save to localStorage
            }
        },
        decrementCartItem: (state, action: PayloadAction<string>) => {
            const item = state.cartItems.find(item => item.productId === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
            } else if (item && item.quantity === 1) {
                state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
            }
            const totals = computeCartTotals(state.cartItems, state.discount);
            state.subTotal = totals.subTotal;
            state.shippingCharges = totals.shippingCharges;
            state.tax = totals.tax;
            state.discount = totals.discount;
            state.total = totals.total;
            saveToLocalStorage(state); // Save to localStorage
        },
        calculatePrice: (state) => {
            const totals = computeCartTotals(state.cartItems, state.discount);
            state.subTotal = totals.subTotal;
            state.shippingCharges = totals.shippingCharges;
            state.tax = totals.tax;
            state.discount = totals.discount;
            state.total = totals.total;
            saveToLocalStorage(state);
        },
        discountApplied: (state, action: PayloadAction<number>) => {
            state.discount = Number(action.payload) || 0;
            const totals = computeCartTotals(state.cartItems, state.discount);
            state.subTotal = totals.subTotal;
            state.shippingCharges = totals.shippingCharges;
            state.tax = totals.tax;
            state.discount = totals.discount;
            state.total = totals.total;
            saveToLocalStorage(state); // Save to localStorage
        },
        saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
            state.shippingInfo = action.payload;
            saveToLocalStorage(state); // Save to localStorage
        },
        resetCart: () => {
            try {
                localStorage.removeItem('cartItems');
                localStorage.removeItem('cartDiscount');
                localStorage.removeItem('shippingInfo');
            } catch {}
            return {
                loading: false,
                cartItems: [],
                subTotal: 0,
                tax: 0,
                shippingCharges: 0,
                discount: 0,
                total: 0,
                shippingInfo: { ...defaultShippingInfo }
            };
        }
    }
});

export const { addToCart, removeCartItem, incrementCartItem, decrementCartItem, calculatePrice, discountApplied, resetCart, saveShippingInfo } = cartReducer.actions;
export default cartReducer.reducer;
