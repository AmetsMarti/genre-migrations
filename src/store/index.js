import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import dataReducer from './slices/dataSlice';

export const store = configureStore({
    reducer: {
        filters: filterReducer,
        data: dataReducer,
    },
});
