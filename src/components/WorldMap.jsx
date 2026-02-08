import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import worldData from '../assets/world.json';
import { Box } from '@mui/joy';
import { useFilters, useData } from '../store/hooks';

const WorldMap = () => {
    const svgRef = useRef();
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

    useEffect(() => {
        if (!svgRef.current) return;

        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // --- 2D PROJECTION CONFIGURATION ---
        const projection = d3.geoNaturalEarth1()
            .scale(width / 5.5)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // --- DATA PROCESSING FOR CHOROPLETH ---
        const filteredBooks = books.filter(book => {
            const yearMatch = book.year >= timeSpan[0] && book.year <= timeSpan[1];
            const genreMatch = !selectedGenre || book.genre === selectedGenre;
            return yearMatch && genreMatch;
        });

        // Simple country counting based on birthplace string for simulation
        const countryCounts = {};
        filteredBooks.forEach(b => {
            const country = b.author_birthplace.split(', ').pop();
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        });

        const colorScale = d3.scaleThreshold()
            .domain([1, 5, 20, 50])
            .range(['rgba(255,255,255,0.05)', 'rgba(100,100,110,0.3)', 'rgba(120,120,140,0.5)', 'rgba(140,140,170,0.7)', 'rgba(160,160,200,0.9)']);

        // --- ZOOM & PAN ---
        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);
        const g = svg.append('g');

        // --- RENDERING MAP LAYERS ---
        // Countries (Choropleth)
        g.selectAll('.country')
            .data(worldData.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path)
            .attr('fill', d => {
                const count = countryCounts[d.properties.name] || 0;
                return count > 0 ? colorScale(count) : 'rgba(255, 255, 255, 0.03)';
            })
            .attr('stroke', 'rgba(255, 255, 255, 0.1)')
            .attr('stroke-width', 0.5)
            .on('mouseenter', function (event, d) {
                const count = countryCounts[d.properties.name] || 0;
                d3.select(this)
                    .transition().duration(200)
                    .attr('fill', count > 0 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.1)');
            })
            .on('mouseleave', function () {
                d3.select(this)
                    .transition().duration(200)
                    .attr('fill', d => {
                        const count = countryCounts[d.properties.name] || 0;
                        return count > 0 ? colorScale(count) : 'rgba(255, 255, 255, 0.03)';
                    });
            });
    }, [dimensions, books, timeSpan, selectedGenre]);

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
                bgcolor: '#020204' // Deeper dark
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
