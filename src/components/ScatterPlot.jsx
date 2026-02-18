import React, { useMemo, useState } from 'react';
import { Box, Tooltip, Typography, Stack, CircularProgress } from '@mui/joy';
import { useData, useFilters } from '../store/hooks';
import { useTSNE } from '../hooks/useTSNE';
import * as d3 from 'd3';

const ScatterPlot = () => {
    const { genreList } = useData();
    const { timeSpan, selectedGenre } = useFilters();
    const [hoveredBook, setHoveredBook] = useState(null);
    const { books } = useData();

    // Dynamic Color Scale
    const colorScale = useMemo(() => {
        const palette = d3.schemeSpectral[11] || d3.schemeCategory10;
        return d3.scaleOrdinal(palette).domain(genreList);
    }, [genreList]);

    const getColor = (genre) => colorScale(genre);

    // Filter books based on time and genre selection
    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const yearMatch = book.Año >= timeSpan[0] && book.Año <= timeSpan[1];
            const genreMatch = !selectedGenre || book.Genero === selectedGenre;
            return yearMatch && genreMatch;
        });
    }, [books, timeSpan, selectedGenre]);

    // Compute t-SNE in real-time based on topics
    const { tsneCoords, isComputing } = useTSNE(filteredBooks);

    const activeGenres = useMemo(() => {
        if (selectedGenre) return [selectedGenre];
        const s = new Set(filteredBooks.map(b => b.Genero));
        return Array.from(s).sort();
    }, [filteredBooks, selectedGenre]);

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* AXES LABELS - Dark Text */}
            <Typography level="body-xs" sx={{ position: 'absolute', bottom: 4, right: 8, color: 'var(--text-muted)', fontSize: '10px' }}>
                Dimension 1 →
            </Typography>
            <Typography level="body-xs" sx={{ position: 'absolute', top: 4, left: 4, color: 'var(--text-muted)', fontSize: '10px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                Dimension 2 →
            </Typography>

            {/* AXES LINES - Darker Lines */}
            <svg width="100%" height="100%" style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0 }}>
                <line x1="10%" y1="90%" x2="90%" y2="90%" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                <line x1="10%" y1="90%" x2="10%" y2="10%" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            </svg>

            <Typography level="title-sm" sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-main)', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>
                Semantic Space (t-SNE)
            </Typography>

            {/* LOADING INDICATOR */}
            {isComputing && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <CircularProgress size="sm" variant="soft" />
                    <Typography level="body-xs" sx={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                        Computing t-SNE...
                    </Typography>
                </Box>
            )}

            {/* PLOT AREA */}
            <Box sx={{
                position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%',
                opacity: isComputing ? 0.3 : 1,
                transition: 'opacity 0.3s ease',
            }}>
                {filteredBooks.map((book) => {
                    const coords = tsneCoords[book.id];
                    if (!coords) return null;
                    const [x, y] = coords;

                    const isMigrated = book.Pais_Autor !== book.Pais_Publicacion;
                    const color = getColor(book.Genero);
                    const isHovered = hoveredBook === book.id;

                    return (
                        <Tooltip
                            key={book.id}
                            title={
                                <Box sx={{ p: 0.5 }}>
                                    <Typography level="title-sm" textColor="#fff">{book.Titulo}</Typography>
                                    <Typography level="body-xs" textColor="neutral.200">{book.Autor}</Typography>
                                    <Typography level="body-xs" sx={{ color: '#fff' }}>{book.Genero} • {book.Temas}</Typography>
                                    {isMigrated && (
                                        <Typography level="body-xs" textColor="success.300" sx={{ mt: 0.5 }}>
                                            📍 {book.Pais_Autor} ➔ {book.Pais_Publicacion}
                                        </Typography>
                                    )}
                                </Box>
                            }
                            variant="outlined"
                            arrow
                            placement="right"
                            sx={{ bgcolor: 'rgba(30, 41, 59, 0.95)', border: 'none', boxShadow: 'lg' }}
                        >
                            <Box
                                onMouseEnter={() => setHoveredBook(book.id)}
                                onMouseLeave={() => setHoveredBook(null)}
                                sx={{
                                    position: 'absolute',
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    width: isHovered ? 12 : 3,
                                    height: isHovered ? 12 : 3,
                                    borderRadius: '50%',
                                    bgcolor: color,
                                    transform: 'translate(-50%, -50%)',
                                    opacity: isHovered ? 1 : 0.7,
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    zIndex: isHovered ? 20 : 1,
                                    boxShadow: isHovered ? `0 0 10px ${color}` : 'none',
                                    border: isMigrated ? `1px solid ${color}` : 'none'
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Box>

            {/* LEGEND OVERLAY - Dark Text */}
            <Box sx={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                zIndex: 5,
                pointerEvents: 'none'
            }}>
                <Stack spacing={0.5}>
                    {activeGenres.slice(0, 5).map(genre => (
                        <Stack key={genre} direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getColor(genre) }} />
                            <Typography level="body-xs" sx={{ fontSize: '9px', opacity: 0.8, color: 'var(--text-main)' }}>
                                {genre}
                            </Typography>
                        </Stack>
                    ))}
                    {activeGenres.length > 5 && (
                        <Typography level="body-xs" sx={{ fontSize: '9px', opacity: 0.5, pl: 2, color: 'var(--text-main)' }}>
                            + {activeGenres.length - 5} more
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default ScatterPlot;
