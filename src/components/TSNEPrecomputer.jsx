import { useEffect, useRef } from 'react';
import { useData } from '../store/hooks';

/**
 * Component that runs t-SNE once for all books on mount.
 * Results are stored in Redux for all other components to use.
 */
const TSNEPrecomputer = () => {
    const { books, tsneStatus, updateTsneCoords, updateTsneStatus } = useData();
    const workerRef = useRef(null);

    useEffect(() => {
        // Only run once if idle
        if (tsneStatus !== 'idle') return;

        if (!books || books.length < 3) {
            updateTsneStatus('ready');
            return;
        }

        updateTsneStatus('computing');

        const worker = new Worker(
            new URL('../workers/tsneWorker.js', import.meta.url),
            { type: 'module' }
        );
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const { tsneCoords, error } = e.data;
            if (error) {
                console.error('t-SNE Precomputation Error:', error);
                updateTsneStatus('idle'); // Allow retry or handle error
            } else {
                updateTsneCoords(tsneCoords);
                updateTsneStatus('ready');
            }
            worker.terminate();
        };

        worker.onerror = (err) => {
            console.error('t-SNE Worker Error:', err);
            updateTsneStatus('idle');
            worker.terminate();
        };

    
        const lightBooks = books.map(b => ({
            id: b.id,
            Temas: b.Temas,
        }));

        worker.postMessage({ books: lightBooks });

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, [books, tsneStatus, updateTsneCoords, updateTsneStatus]);

    return null; // Renderless component
};

export default TSNEPrecomputer;
