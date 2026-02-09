import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    timeSpan: [1980, 1990],
    selectedGenre: null,
    selectedRegion: null,
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setTimeSpan: (state, action) => {
            state.timeSpan = action.payload;
        },
        setSelectedGenre: (state, action) => {
            state.selectedGenre = action.payload;
        },
        setSelectedRegion: (state, action) => {
            state.selectedRegion = action.payload;
        },
    },
});

export const { setTimeSpan, setSelectedGenre, setSelectedRegion } = filterSlice.actions;
export default filterSlice.reducer;
