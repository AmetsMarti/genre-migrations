import React from 'react';
import Header from '../components/Header';
import GenreSelector from '../components/GenreSelector';
import HistogramTimeline from '../components/HistogramTimeline';
import WorldMap from '../components/WorldMap';
import ScatterPlot from '../components/ScatterPlot';
import InsightsPanel from '../components/InsightsPanel';
import { Box } from '@mui/joy';

const Mapview = () => {
  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* BACKGROUND MAP */}
      <WorldMap />

      {/* LEFT WHITE BORDER */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '340px',
          height: '100vh',
          bgcolor: 'white',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />

      {/* RIGHT WHITE BORDER */}
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '360px',
          height: '100vh',
          bgcolor: 'white',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />

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
          overflow: 'visible'
        }}
      >
        <ScatterPlot />
      </Box>

      {/* RIGHT INSIGHTS PANEL */}
      <InsightsPanel />

      {/* BOTTOM TIMELINE */}
      <Box className="bottom-panel" sx={{ px: "100px" }}>
        <HistogramTimeline />
      </Box>
    </Box>
  );
};

export default Mapview;
