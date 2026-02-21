import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    useWorker: true, // Use worker by default for t-SNE computation
    isLoading: false, // App-level loading state
};

const appSettingsSlice = createSlice({
    name: 'appSettings',
    initialState,
    reducers: {
        setUseWorker: (state, action) => {
            state.useWorker = action.payload;
        },
        setAppLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setUseWorker, setAppLoading } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
