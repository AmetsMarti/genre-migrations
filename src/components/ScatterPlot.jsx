import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/joy';
import { useData, useFilters } from '../store/hooks';
import { useTSNE } from '../hooks/useTSNE';
import * as d3 from 'd3';

const ScatterPlot = () => {
    const { genreList, books } = useData();
    const { timeSpan, selectedGenre } = useFilters();
    const [hoveredBook, setHoveredBook] = useState(null);
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Filter books based on time and genre selection
    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const yearMatch = book.Año >= timeSpan[0] && book.Año <= timeSpan[1];
            const genreMatch = !selectedGenre || book.Genero === selectedGenre;
            return yearMatch && genreMatch;
        });
    }, [books, timeSpan, selectedGenre]);

    // Real-time t-SNE computation for filtered books
    const { tsneCoords, isComputing } = useTSNE(filteredBooks);

    const activeGenres = useMemo(() => {
        if (selectedGenre) return [selectedGenre];
        const s = new Set(filteredBooks.map(b => b.Genero));
        return Array.from(s).sort();
    }, [filteredBooks, selectedGenre]);

    // Dynamic color scale based on genres
    const colorScale = useMemo(() => {
        const palette = d3.schemeSpectral[11] || d3.schemeCategory10;
        return d3.scaleOrdinal(palette).domain(genreList);
    }, [genreList]);

    const getColor = (genre) => colorScale(genre);

    // D3 Rendering Logic
    useEffect(() => {
        if (isComputing || !svgRef.current || !containerRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        if (width === 0 || height === 0) return;

        // Create scales to map [0, 100] (normalized workers coords) to pixels
        const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

        // Container for dots
        let g = svg.select('g.dots-container');
        if (g.empty()) {
            g = svg.append('g').attr('class', 'dots-container');
        }

        const data = filteredBooks.filter(b => tsneCoords[b.id]);

        // JOIN
        const circles = g.selectAll('circle')
            .data(data, d => d.id);

        // EXIT
        circles.exit()
            .transition()
            .duration(300)
            .attr('r', 0)
            .remove();

        // ENTER
        const enter = circles.enter()
            .append('circle')
            .attr('r', 0)
            .attr('cx', d => xScale(tsneCoords[d.id][0]))
            .attr('cy', d => yScale(tsneCoords[d.id][1]))
            .attr('fill', d => getColor(d.Genero))
            .attr('fill-opacity', 0.6)
            .attr('cursor', 'pointer');

        // UPDATE + ENTER MERGE
        enter.merge(circles)
            .on('mouseenter', (event, d) => {
                setHoveredBook(d);
                d3.select(event.currentTarget)
                    .raise()
                    .transition().duration(200)
                    .attr('r', 7)
                    .attr('fill-opacity', 1)
                    .style('filter', `drop-shadow(0 0 6px ${getColor(d.Genero)})`);
            })
            .on('mouseleave', (event, d) => {
                setHoveredBook(null);
                d3.select(event.currentTarget)
                    .transition().duration(200)
                    .attr('r', 3.5)
                    .attr('fill-opacity', 0.6)
                    .style('filter', 'none');
            })
            .transition()
            .duration(500)
            .attr('cx', d => xScale(tsneCoords[d.id][0]))
            .attr('cy', d => yScale(tsneCoords[d.id][1]))
            .attr('r', 3.5)
            .attr('fill', d => getColor(d.Genero))
            .attr('stroke', d => d.Pais_Autor !== d.Pais_Publicacion ? '#fff' : 'none')
            .attr('stroke-width', d => d.Pais_Autor !== d.Pais_Publicacion ? 1 : 0);

    }, [filteredBooks, tsneCoords, isComputing, getColor]);

    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Semantic Frame */}
            <Typography level="body-xs" sx={{ position: 'absolute', bottom: 4, right: 12, color: 'var(--text-muted)', fontSize: '10px', opacity: 0.8 }}>
                Dimension 1 →
            </Typography>
            <Typography level="body-xs" sx={{ position: 'absolute', top: 12, left: 4, color: 'var(--text-muted)', fontSize: '10px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', opacity: 0.8 }}>
                Dimension 2 →
            </Typography>

            <svg width="100%" height="100%" style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0 }}>
                <line x1="5%" y1="95%" x2="95%" y2="95%" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                <line x1="5%" y1="95%" x2="5%" y2="5%" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            </svg>

            <Typography level="title-sm" sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-main)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '9px', fontWeight: 700 }}>
                Semantic Landscape
            </Typography>

            {/* INITIAL LOADING */}
            {isComputing && (
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                    <CircularProgress size="md" variant="plain" thickness={2} />
                    <Typography level="body-xs" sx={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.5px' }}>
                        MAPPING SEMANTIC SPACE...
                    </Typography>
                </Box>
            )}

            {/* D3 VIEWPORT */}
            <Box ref={containerRef} sx={{
                position: 'absolute', top: '8%', left: '8%', right: '8%', bottom: '8%',
                opacity: isComputing ? 0 : 1,
                transition: 'opacity 1.5s ease'
            }}>
                <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }} />
            </Box>

            {/* FLOATING TOOLTIP */}
            {hoveredBook && tsneCoords[hoveredBook.id] && (
                <Box sx={{
                    position: 'absolute',
                    left: `${tsneCoords[hoveredBook.id][0]}%`,
                    top: `${100 - tsneCoords[hoveredBook.id][1]}%`,
                    transform: 'translate(20px, -50%)',
                    bgcolor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(4px)',
                    p: 1.5,
                    borderRadius: 'md',
                    zIndex: 100,
                    pointerEvents: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    minWidth: 240,
                    color: '#fff',
                    borderLeft: `4px solid ${getColor(hoveredBook.Genero)}`,
                    transition: 'all 0.1s ease-out'
                }}>
                    <Typography level="title-md" sx={{ color: '#fff', mb: 0.5 }}>{hoveredBook.Titulo}</Typography>
                    <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>{hoveredBook.Autor}</Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
                        <Box sx={{ px: 1, py: 0.2, bgcolor: getColor(hoveredBook.Genero), borderRadius: 'sm' }}>
                            <Typography level="body-xs" sx={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px' }}>
                                {hoveredBook.Genero}
                            </Typography>
                        </Box>
                        <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                            {hoveredBook.Año}
                        </Typography>
                    </Stack>

                    <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, fontSize: '10px', lineHeight: 1.4 }}>
                        {hoveredBook.Temas.split('|').join(' • ')}
                    </Typography>

                    {hoveredBook.Pais_Autor !== hoveredBook.Pais_Publicacion && (
                        <Typography level="body-xs" sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)', color: 'success.300', fontWeight: 600 }}>
                            MIGRATION: {hoveredBook.Pais_Autor} ➔ {hoveredBook.Pais_Publicacion}
                        </Typography>
                    )}
                </Box>
            )}

            {/* MINIMALIST LEGEND */}
            <Box sx={{
                position: 'absolute', bottom: 16, left: 16,
                display: 'flex', flexDirection: 'column', gap: 1,
                zIndex: 1, pointerEvents: 'none',
                bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)',
                p: 1.5, borderRadius: 'md'
            }}>
                <Stack spacing={0.8}>
                    {activeGenres.slice(0, 6).map(genre => (
                        <Stack key={genre} direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: getColor(genre), boxShadow: `0 0 4px ${getColor(genre)}` }} />
                            <Typography level="body-xs" sx={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-main)', opacity: 0.9 }}>
                                {genre}
                            </Typography>
                        </Stack>
                    ))}
                    {activeGenres.length > 6 && (
                        <Typography level="body-xs" sx={{ fontSize: '9px', opacity: 0.5, pl: 2 }}>
                            + {activeGenres.length - 6} more
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default ScatterPlot;
