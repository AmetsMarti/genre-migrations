import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import dataReducer from './slices/dataSlice';
import appSettingsReducer from './slices/appSettingsSlice';

export const store = configureStore({
    reducer: {
        filters: filterReducer,
        data: dataReducer,
        appSettings: appSettingsReducer,
    },
});
