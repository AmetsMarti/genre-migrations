import { useDispatch, useSelector } from 'react-redux';
import { setTimeSpan, setSelectedGenre, setSelectedRegion } from './slices/filterSlice';
import { setBooks, setGenreList, setLoading, setError } from './slices/dataSlice';

// --- Filter Level ---
export const useFilters = () => {
    const dispatch = useDispatch();
    const filters = useSelector((state) => state.filters);

    return {
        ...filters,
        updateTimeSpan: (span) => dispatch(setTimeSpan(span)),
        updateGenre: (genre) => dispatch(setSelectedGenre(genre)),
        updateRegion: (region) => dispatch(setSelectedRegion(region)),
    };
};

// --- Data Level ---
export const useData = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);

    return {
        ...data,
        updateBooks: (books) => dispatch(setBooks(books)),
        updateGenreList: (list) => dispatch(setGenreList(list)),
        startLoading: () => dispatch(setLoading()),
        reportError: (err) => dispatch(setError(err)),
    };
};
