import simulationData from '../../assets/books_simulation.json';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    books: simulationData,
    status: 'succeeded', // Initialize with loaded simulation data
    error: null,
    genreList: ["Fantasy", "Sci-Fi", "History", "Thriller", "Horror", "Romance", "Western", "Religion"],
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
