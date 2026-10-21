import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserReducerIntialState ,User} from "../../types/api-types";

const storedUser = localStorage.getItem('user');

const initialState: UserReducerIntialState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        userExists: (state, action: PayloadAction<User>) => {
            state.loading = false;
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        userNotExists: (state) => {
            state.loading = false;
            state.user = null;
            localStorage.removeItem('user');
        }
    }
});

export const { userExists, userNotExists } = userSlice.actions;

export default userSlice.reducer;

