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

const initialState: CartReducerIntialState = {
    loading: false,
    cartItems: JSON.parse(localStorage.getItem('cartItems') || '[]'),
    subTotal: 0,
    tax: 0,
    shippingCharges: 0,
    discount: 0,
    total: 0,
    shippingInfo: JSON.parse(localStorage.getItem('shippingInfo') || JSON.stringify(defaultShippingInfo))
};

const saveToLocalStorage = (state: CartReducerIntialState) => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo));
};

export const cartReducer = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            state.loading = true;

            const cartCurrency = state.cartItems[0]?.currency || 'INR';
            const itemCurrency = action.payload.currency || 'INR';
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

            state.loading = false;
            saveToLocalStorage(state); // Save to localStorage
        },
        removeCartItem: (state, action: PayloadAction<string>) => {
            state.loading = true;
            state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
            state.loading = false;
            saveToLocalStorage(state); // Save to localStorage
        },
        incrementCartItem: (state, action: PayloadAction<string>) => {
            const item = state.cartItems.find(item => item.productId === action.payload);
            if (item && item.quantity < item.stock) {
                item.quantity += 1;
                saveToLocalStorage(state); // Save to localStorage
            }
        },
        decrementCartItem: (state, action: PayloadAction<string>) => {
            const item = state.cartItems.find(item => item.productId === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                saveToLocalStorage(state); // Save to localStorage
            } else if (item && item.quantity === 1) {
                state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
                saveToLocalStorage(state); // Save to localStorage
            }
        },
        calculatePrice: (state) => {
            const subTotal = state.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            state.subTotal = subTotal;
            state.shippingCharges = subTotal > 0 && subTotal < 35 ? 3.75 : 0;
            state.tax = 0;
            state.total = state.subTotal + state.shippingCharges - state.discount;
            // If the discount is greater than the total price, limit the discount to the total price
            if (state.total < 0) {
                state.discount = state.subTotal;
                state.total = 0;
            }
        },
        discountApplied: (state, action: PayloadAction<number>) => {
            state.discount = action.payload;
            // If the discount is greater than the total price, limit the discount to the total price
            if (state.discount > state.total) {
                state.discount = state.total;
            }
            saveToLocalStorage(state); // Save to localStorage
        },
        saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
            state.shippingInfo = action.payload;
            saveToLocalStorage(state); // Save to localStorage
        },
        resetCart: () => {
            localStorage.removeItem('cartItems');
            localStorage.removeItem('shippingInfo');
            return {
                ...initialState,
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
