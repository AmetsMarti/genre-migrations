import React from 'react';
import Header from '../components/Header';
import GenreSelector from '../components/GenreSelector';
import HistogramTimeline from '../components/HistogramTimeline';
import WorldMap from '../components/WorldMap';
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

      {/* BOTTOM TIMELINE */}
      <Box className="bottom-panel" sx={{ px: "100px" }}>
        <HistogramTimeline />
      </Box>
    </Box>
  );
};

export default Mapview;
