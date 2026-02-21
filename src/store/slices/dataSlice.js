import simulationData from '../../assets/real_data.json';
import { createSlice } from '@reduxjs/toolkit';

// Add id to each book if not present
const booksWithIds = simulationData.map((item, index) => ({
    ...item,
    id: item.id || index + 1,
}));

const initialState = {
    books: booksWithIds,
    status: 'succeeded',
    error: null,
    genreList: [...new Set(booksWithIds.map(item => item.Genero))].sort(),
    tsneCoords: {},
    tsneStatus: 'idle', // 'idle' | 'computing' | 'ready'
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
        setTsneCoords: (state, action) => {
            state.tsneCoords = action.payload;
        },
        setTsneStatus: (state, action) => {
            state.tsneStatus = action.payload;
        },
    },
});

export const { setGenreList, setBooks, setLoading, setError, setTsneCoords, setTsneStatus } = dataSlice.actions;
export default dataSlice.reducer;
