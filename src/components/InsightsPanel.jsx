import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Stack, CircularProgress, Divider } from '@mui/joy';
import { useData, useFilters } from '../store/hooks';
import axios from 'axios';

const InsightsPanel = () => {
    const { books, genreList } = useData();
    const { timeSpan, selectedGenre } = useFilters();
    const [topBook, setTopBook] = useState(null);
    const [loadingBook, setLoadingBook] = useState(false);

    // Filter books based on selections
    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const yearMatch = book.Año >= timeSpan[0] && book.Año <= timeSpan[1];
            const genreMatch = !selectedGenre || book.Genero === selectedGenre;
            return yearMatch && genreMatch;
        });
    }, [books, timeSpan, selectedGenre]);

    // Calculate genre distribution
    const genreStats = useMemo(() => {
        if (filteredBooks.length === 0) return [];
        
        const counts = {};
        filteredBooks.forEach(book => {
            counts[book.Genero] = (counts[book.Genero] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([genre, count]) => ({
                genre,
                count,
                percentage: ((count / filteredBooks.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredBooks]);

    // Fetch most famous book from OpenLibrary
    useEffect(() => {
        if (filteredBooks.length === 0) {
            setTopBook(null);
            return;
        }

        setLoadingBook(true);
        
        // Try to fetch the most popular book from the filtered set
        const fetchMostFamousBook = async () => {
            try {
                // Get a random sample of books and check their popularity
                const sample = filteredBooks.sort(() => 0.5 - Math.random()).slice(0, 10);
                
                let bestBook = null;
                let maxEditions = 0;

                for (const book of sample) {
                    try {
                        const response = await axios.get(
                            `https://openlibrary.org/search.json?title=${encodeURIComponent(book.Titulo)}&author=${encodeURIComponent(book.Autor)}&limit=1`
                        );
                        
                        if (response.data.docs && response.data.docs.length > 0) {
                            const doc = response.data.docs[0];
                            const editions = doc.edition_count || 0;
                            
                            if (editions > maxEditions) {
                                maxEditions = editions;
                                bestBook = {
                                    titulo: book.Titulo,
                                    autor: book.Autor,
                                    editions: editions,
                                    genero: book.Genero,
                                    año: book.Año
                                };
                            }
                        }
                    } catch (err) {
                        // Continue if a single book fails
                        continue;
                    }
                }

                setTopBook(bestBook || filteredBooks[0]);
            } catch (err) {
                console.error('Error fetching book data:', err);
                // Fallback to first book
                setTopBook(filteredBooks[0]);
            } finally {
                setLoadingBook(false);
            }
        };

        fetchMostFamousBook();
    }, [filteredBooks]);

    return (
        <Box
            className="glass-card"
            sx={{
                position: 'absolute',
                top: '120px',
                right: '20px',
                width: '320px',
                maxHeight: '500px',
                zIndex: 10,
                padding: '20px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            {/* Header */}
            <Box>
                <Typography 
                    level="title-sm" 
                    sx={{ 
                        textTransform: 'uppercase', 
                        letterSpacing: '1.5px', 
                        fontSize: '9px', 
                        fontWeight: 700,
                        opacity: 0.7
                    }}
                >
                    Insights
                </Typography>
            </Box>

            {/* Time Span Stats */}
            <Box>
                <Typography 
                    level="body-xs" 
                    sx={{ opacity: 0.6, fontSize: '9px', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                    Time Span
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography level="title-md" sx={{ fontWeight: 700 }}>
                        {timeSpan[0]} — {timeSpan[1]}
                    </Typography>
                </Stack>
            </Box>

            <Divider sx={{ opacity: 0.3 }} />

            {/* Book Count */}
            <Box>
                <Typography 
                    level="body-xs" 
                    sx={{ opacity: 0.6, fontSize: '9px', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                    Books Found
                </Typography>
                <Typography level="title-md" sx={{ fontWeight: 700 }}>
                    {filteredBooks.length}
                </Typography>
            </Box>

            <Divider sx={{ opacity: 0.3 }} />

            {/* Top Book */}
            <Box>
                <Typography 
                    level="body-xs" 
                    sx={{ opacity: 0.6, fontSize: '9px', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                    Most Famous Book
                </Typography>
                {loadingBook ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                        <CircularProgress size="sm" variant="plain" thickness={2} />
                    </Box>
                ) : topBook ? (
                    <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        borderRadius: 'md',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Typography 
                            level="body-sm" 
                            sx={{ fontWeight: 600, mb: 0.5, fontSize: '11px', lineHeight: 1.3 }}
                        >
                            {topBook.titulo}
                        </Typography>
                        <Typography 
                            level="body-xs" 
                            sx={{ opacity: 0.7, fontStyle: 'italic', fontSize: '10px', mb: 0.5 }}
                        >
                            {topBook.autor}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ fontSize: '9px', opacity: 0.6 }}>
                            <Typography level="body-xs" sx={{ fontSize: '9px' }}>
                                {topBook.año}
                            </Typography>
                            {topBook.editions && (
                                <Typography level="body-xs" sx={{ fontSize: '9px' }}>
                                    • {topBook.editions} editions
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                ) : (
                    <Typography level="body-xs" sx={{ opacity: 0.5, fontStyle: 'italic' }}>
                        No books in this range
                    </Typography>
                )}
            </Box>

            <Divider sx={{ opacity: 0.3 }} />

            {/* Top Genres */}
            <Box>
                <Typography 
                    level="body-xs" 
                    sx={{ opacity: 0.6, fontSize: '9px', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                    Genre Distribution
                </Typography>
                <Stack spacing={0.8}>
                    {genreStats.length > 0 ? (
                        genreStats.map((stat, idx) => (
                            <Box key={idx}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                    <Typography 
                                        level="body-xs" 
                                        sx={{ fontSize: '10px', fontWeight: 600 }}
                                    >
                                        {stat.genre}
                                    </Typography>
                                    <Typography 
                                        level="body-xs" 
                                        sx={{ fontSize: '9px', opacity: 0.7 }}
                                    >
                                        {stat.percentage}%
                                    </Typography>
                                </Box>
                                <Box 
                                    sx={{
                                        height: '4px',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box 
                                        sx={{
                                            height: '100%',
                                            width: `${stat.percentage}%`,
                                            bgcolor: 'rgba(99, 102, 241, 0.7)',
                                            transition: 'width 0.3s ease'
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography level="body-xs" sx={{ opacity: 0.5, fontStyle: 'italic', fontSize: '10px' }}>
                            No genres available
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default InsightsPanel;
