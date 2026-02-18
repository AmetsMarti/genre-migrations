import React from 'react';
import Header from '../components/Header';
import GenreSelector from '../components/GenreSelector';
import HistogramTimeline from '../components/HistogramTimeline';
import WorldMap from '../components/WorldMap';
import ScatterPlot from '../components/ScatterPlot';
import { Box } from '@mui/joy';

const Mapview = () => {
  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* BACKGROUND MAP */}
      <WorldMap />

      {/* TOP UI OVERLAY */}
      <Box className="top-overlay-container">
        <Box className="glass-card">
          <GenreSelector />
        </Box>
      </Box>

      {/* LEFT SCATTERPLOT */}
      <Box
        className="glass-card"
        sx={{
          position: 'absolute',
          top: '120px',
          left: '20px',
          width: '300px',
          height: '300px',
          zIndex: 10,
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <ScatterPlot />
      </Box>

      {/* BOTTOM TIMELINE */}
      <Box className="bottom-panel" sx={{ px: "100px" }}>
        <HistogramTimeline />
      </Box>
    </Box>
  );
};

export default Mapview;
