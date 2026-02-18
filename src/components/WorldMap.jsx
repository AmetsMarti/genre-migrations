import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import worldData from '../assets/world.json';
import { Box, IconButton, ButtonGroup } from '@mui/joy';
import { useFilters, useData } from '../store/hooks';
import { FiPlus, FiMinus, FiMaximize } from 'react-icons/fi';

const WorldMap = () => {
    const svgRef = useRef();
    const gRef = useRef();
    const zoomRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const { books } = useData();
    const { timeSpan, selectedGenre } = useFilters();

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- DATA PROCESSING FOR CHOROPLETH ---
    const countryCounts = useMemo(() => {
        const filteredBooks = books.filter(book => {
            const yearMatch = book.Año >= timeSpan[0] && book.Año <= timeSpan[1];
            const genreMatch = !selectedGenre || book.Genero === selectedGenre;
            return yearMatch && genreMatch;
        });

        const counts = {};
        filteredBooks.forEach(b => {
            const country = b.Pais_Autor.split(', ').pop();
            counts[country] = (counts[country] || 0) + 1;
        });
        return counts;
    }, [books, timeSpan, selectedGenre]);

    const colorScale = useMemo(() => {
        const allCounts = Object.values(countryCounts).filter(c => c > 0);
        return d3.scaleQuantile()
            .domain(allCounts.length ? allCounts : [0, 1])
            .range([
                'rgba(223, 239, 255, 1)',
                'rgba(228, 228, 228, 1)',
                'rgba(193, 193, 193, 1)',
                'rgba(140,140,170,0.7)',
                'rgba(113, 113, 222, 0.9)'
            ]);
    }, [countryCounts]);

    // Initial setup (Geometry & Zoom)
    useEffect(() => {
        if (!svgRef.current) return;

        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const projection = d3.geoNaturalEarth1()
            .scale(width / 5.5)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const zoom = d3.zoom()
            .scaleExtent([1, 15])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        zoomRef.current = zoom;
        svg.call(zoom);

        const g = svg.append('g');
        gRef.current = g;

        g.selectAll('.country')
            .data(worldData.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path)
            .attr('stroke', 'rgba(0, 0, 0, 0.1)')
            .attr('stroke-width', 0.5)
            .attr('fill', 'rgba(255, 255, 255, 0.03)') // Initial neutral color
            .on('mouseenter', function (event, d) {
                const count = countryCounts[d.properties.name] || 0;
                d3.select(this)
                    .transition().duration(200)
                    .attr('fill', count > 0 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.1)');
            })
            .on('mouseleave', function (event, d) {
                const count = countryCounts[d.properties.name] || 0;
                d3.select(this)
                    .transition().duration(200)
                    .attr('fill', count > 0 ? colorScale(count) : 'rgba(255, 255, 255, 0.03)');
            });

        // Trigger dynamic coloring immediately
        updateColors();
    }, [dimensions]);

    // Data Coloring Update
    const updateColors = () => {
        if (!gRef.current) return;
        gRef.current.selectAll('.country')
            .transition().duration(500)
            .attr('fill', d => {
                const count = countryCounts[d.properties.name] || 0;
                return count > 0 ? colorScale(count) : 'rgba(255, 255, 255, 0.03)';
            });
    };

    useEffect(() => {
        updateColors();
    }, [countryCounts, colorScale]);

    // Zoom Handlers
    const handleZoomIn = () => {
        if (svgRef.current && zoomRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
        }
    };

    const handleZoomOut = () => {
        if (svgRef.current && zoomRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
        }
    };

    const handleReset = () => {
        if (svgRef.current && zoomRef.current) {
            d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                bgcolor: '#ffffff'
            }}
        >
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ cursor: 'grab' }}
            />

        </Box>
    );
};

export default WorldMap;
