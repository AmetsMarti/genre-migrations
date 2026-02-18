import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Box, Typography } from '@mui/joy';
import { useFilters, useData } from '../store/hooks';

const HistogramTimeline = () => {
    const containerRef = useRef();
    const svgRef = useRef();
    const { books } = useData();
    const { timeSpan, updateTimeSpan, selectedGenre } = useFilters();

    const filteredBooksByGenre = books.filter(book => book.Genero === selectedGenre);

    // Process data for histogram
    const histogramData = useMemo(() => {
        if (!books.length) return [];
        const counts = {};
        filteredBooksByGenre.forEach(book => {
            counts[book.Año] = (counts[book.Año] || 0) + 1;
        });

        const years = Object.keys(counts).map(Number).sort((a, b) => a - b);
        const minYear = 1980;
        const maxYear = 2020;

        const fullData = [];
        for (let y = minYear; y <= maxYear; y++) {
            fullData.push({ year: y, count: counts[y] || 0 });
        }
        return fullData;
    }, [books, selectedGenre]);

    useEffect(() => {
        if (!svgRef.current || !histogramData.length) return;

        const margin = { top: 5, right: 10, bottom: 20, left: 10 };
        const width = containerRef.current.clientWidth - margin.left - margin.right;
        const height = 80 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const x = d3.scaleLinear()
            .domain([d3.min(histogramData, d => d.year), d3.max(histogramData, d => d.year) + 1])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(histogramData, d => d.count)])
            .range([height, 0]);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Draw Bars
        const barWidth = width / histogramData.length;
        g.selectAll('.bar')
            .data(histogramData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.year))
            .attr('y', d => y(d.count))
            .attr('width', Math.max(1, barWidth - 1))
            .attr('height', d => height - y(d.count))
            .attr('fill', '#696969ff')
            .attr('rx', 1.5);

        // Highlight selected range
        const brushG = g.append('g').attr('class', 'brush');

        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on('brush end', (event) => {
                // Only update if the event comes from user interaction (mouse/touch)
                if (!event.sourceEvent) return;

                const selection = event.selection;
                if (!selection) return;

                const [x0, x1] = selection.map(x.invert);
                const start = Math.round(x0);
                const end = Math.max(start, Math.round(x1) - 1);
                const newSpan = [start, end];

                if (newSpan[0] !== timeSpan[0] || newSpan[1] !== timeSpan[1]) {
                    updateTimeSpan(newSpan);
                }

                // Update visuals instantly for snappiness
                g.selectAll('.bar')
                    .attr('fill', d => (d.year >= newSpan[0] && d.year <= newSpan[1]) ? 'var(--primary)' : '#696969ff');
            });

        brushG.call(brush)
            .call(brush.move, [x(timeSpan[0]), x(timeSpan[1] + 1)]);

        // Initial bar coloring based on timeSpan
        g.selectAll('.bar')
            .attr('fill', d => (d.year >= timeSpan[0] && d.year <= timeSpan[1]) ? 'var(--primary)' : '#696969ff');

        // X Axis
        g.append('g')
            .attr('transform', `translate(0,${height + 4})`)
            .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')))
            .attr('color', '#94a3b8')
            .attr('font-size', '9px')
            .select('.domain').remove();

    }, [histogramData, timeSpan]); // Sync with timeSpan updates from outside too

    return (
        <Box ref={containerRef} className="glass-card" sx={{ height: '100%', flexDirection: 'column', p: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0, px: 2 }}>
                <Typography level="body-xs" fontWeight="bold" sx={{ fontSize: '10px' }}>{timeSpan[0]}</Typography>
                <Typography level="body-xs" color="neutral" sx={{ opacity: 0.6, fontSize: '9px' }}>Time Range Selector</Typography>
                <Typography level="body-xs" fontWeight="bold" sx={{ fontSize: '10px' }}>{timeSpan[1]}</Typography>
            </Box>
            <svg ref={svgRef} width="100%" height="100%" />
        </Box>
    );
};

export default HistogramTimeline;
