import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    books: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    genreList: ["Sci-Fi", "Fantasy", "History"],
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setBooks: (state, action) => {
            state.books = action.payload;
            state.status = 'succeeded';
        },
        setGenreList: (state, action) => {
            state.genreList = action.payload;
        },
        setLoading: (state) => {
            state.status = 'loading';
        },
        setError: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const { setGenreList, setBooks, setLoading, setError } = dataSlice.actions;
export default dataSlice.reducer;
