import { useDispatch, useSelector } from 'react-redux';
import { setTimeSpan, setSelectedGenre, setSelectedRegion } from './slices/filterSlice';
import { setBooks, setGenreList, setLoading, setError, setTsneCoords, setTsneStatus } from './slices/dataSlice';
import { setUseWorker, setAppLoading } from './slices/appSettingsSlice';

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
        updateTsneCoords: (coords) => dispatch(setTsneCoords(coords)),
        updateTsneStatus: (status) => dispatch(setTsneStatus(status)),
    };
};

// --- App Settings Level ---
export const useAppSettings = () => {
    const dispatch = useDispatch();
    const settings = useSelector((state) => state.appSettings);

    return {
        ...settings,
        toggleUseWorker: (value) => dispatch(setUseWorker(value)),
        setAppLoading: (value) => dispatch(setAppLoading(value)),
    };
};
