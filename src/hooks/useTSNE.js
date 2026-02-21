import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { computeTSNEDirect } from '../utils/tsneCompute';

/**
 * Custom hook that computes t-SNE coordinates either in a Web Worker
 * or directly in the main thread, based on Redux app settings.
 * 
 * @param {Array} books - The filtered array of books
 * @returns {{ tsneCoords: Object, isComputing: boolean }}
 */
export function useTSNE(books) {
    const [tsneCoords, setTsneCoords] = useState({});
    const [isComputing, setIsComputing] = useState(false);
    const workerRef = useRef(null);
    const requestIdRef = useRef(0);
    const useWorker = useSelector((state) => state.appSettings.useWorker);

    // Create a stable fingerprint of the books array to avoid unnecessary recomputations
    const booksFingerprint = useMemo(() => {
        if (!books || books.length === 0) return '';
        return books.map(b => b.id).join(',');
    }, [books]);

    useEffect(() => {
        if (!books || books.length < 3) {
            setTsneCoords({});
            setIsComputing(false);
            return;
        }

        // Increment request ID to handle race conditions
        const currentRequestId = ++requestIdRef.current;
        setIsComputing(true);

        if (useWorker) {
            // --- USE WORKER MODE ---
            // Create worker
            const worker = new Worker(
                new URL('../workers/tsneWorker.js', import.meta.url),
                { type: 'module' }
            );

            // Terminate previous worker if still running
            if (workerRef.current) {
                workerRef.current.terminate();
            }
            workerRef.current = worker;

            worker.onmessage = (e) => {
                // Only accept results from the latest request
                if (currentRequestId === requestIdRef.current) {
                    setTsneCoords(e.data.tsneCoords || {});
                    setIsComputing(false);
                }
            };

            worker.onerror = (err) => {
                console.error('t-SNE Worker error:', err);
                if (currentRequestId === requestIdRef.current) {
                    setIsComputing(false);
                }
            };

            // Send books to worker (only necessary fields to minimize transfer)
            const lightBooks = books.map(b => ({
                id: b.id,
                Temas: b.Temas,
            }));
            worker.postMessage({ books: lightBooks });

            return () => {
                worker.terminate();
            };
        } else {
            // --- DIRECT COMPUTATION MODE (NO WORKER) ---
            // Compute t-SNE directly in main thread
            // Use setTimeout to allow UI to update before heavy computation
            const timeoutId = setTimeout(() => {
                if (currentRequestId === requestIdRef.current) {
                    const coords = computeTSNEDirect(books);
                    setTsneCoords(coords);
                    setIsComputing(false);
                }
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [booksFingerprint, useWorker]); // eslint-disable-line react-hooks/exhaustive-deps

    return { tsneCoords, isComputing };
}
