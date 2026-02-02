import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/joy';
import { GiEarthAmerica } from 'react-icons/gi';

// --- VISUAL COMPONENTS ---

const FakeScatterPlot = () => {
  // Generate random dots for the scatter plot
  // Memoized to prevent flickering on re-renders
  const dots = React.useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.5 + 0.3,
    color: i % 2 === 0 ? '#6366f1' : '#ec4899', // Two distinct colors for clusters
  })), []);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {dots.map((dot) => (
        <Box
          key={dot.id}
          sx={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            bgcolor: dot.color,
            opacity: dot.opacity,
            boxShadow: `0 0 ${dot.size * 2}px ${dot.color}`,
            animation: `pulse ${dot.duration}s ease-in-out infinite`,
            animationDelay: `${dot.delay}s`,
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: dot.opacity },
              '50%': { transform: 'scale(1.5)', opacity: 1 },
            },
          }}
        />
      ))}
    </Box>
  );
};

const FakeChronogram = () => {
  // Memoized bars
  const bars = React.useMemo(() => Array.from({ length: 50 }).map((_, i) => {
    // bell-ish curve
    const x = (i - 25) / 10;
    const height = Math.exp(-x * x) * 80 + Math.random() * 20;
    return { id: i, height: `${height}%` };
  }), []);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Abstract Brush Selection overlay */}
      <Box
        sx={{
          position: 'absolute',
          left: '30%',
          width: '40%',
          height: '100%',
          borderLeft: '1px solid rgba(255,255,255,0.5)',
          borderRight: '1px solid rgba(255,255,255,0.5)',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          zIndex: 5,
          pointerEvents: 'none' // Visual brush only
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '100%', width: '100%' }}>
        {bars.map((bar) => (
          <Box
            key={bar.id}
            sx={{
              width: '4px',
              height: bar.height,
              borderRadius: '2px',
              background: 'linear-gradient(to top, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.8) 100%)',
              transition: 'height 0.4s ease',
              '&:hover': {
                background: 'linear-gradient(to top, rgba(255,255,255,0.3) 0%, #fff 100%)',
                height: `min(100%, calc(${bar.height} + 10%))`
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const FakeInsights = () => (
  <Stack spacing={2} sx={{ width: '100%', justifyContent: 'center', height: '100%', px: 1 }}>
    {[80, 45, 65].map((width, i) => (
      <Box key={i} sx={{ width: '100%', height: '8px', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <Box
          sx={{
            width: `${width}%`,
            height: '100%',
            bgcolor: 'common.white',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(255,255,255,0.5)',
            animation: 'grow 2s ease-out forwards',
            '@keyframes grow': {
              from: { width: '0%' },
              to: { width: `${width}%` }
            }
          }}
        />
      </Box>
    ))}
    {/* Circle Chart Abstract */}
    <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', transform: 'rotate(45deg)' }} />
      <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderRightColor: 'white', transform: 'rotate(-25deg)' }} />
    </Box>
  </Stack>
);


// --- MAIN LAYOUT ---

const FloatingPanel = ({ children, sx = {} }) => (
  <Box
    sx={{
      border: '1px solid rgba(255, 255, 255, 0.1)',
      p: 0,
      position: 'absolute',
      zIndex: 10,
      backdropFilter: 'blur(30px)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '32px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      ...sx
    }}
  >
    {children}
  </Box>
);

const VisualFilterLegend = () => (
  <Stack direction="row" spacing={3} alignItems="center">
    {/* Interactive Legend Visuals - Replaces "Genre" Button */}
    <Stack spacing={0.5}>
      <Typography level="body-xs" textColor="common.white" fontWeight="lg" letterSpacing="1px" fontSize="10px" textTransform="uppercase" sx={{ opacity: 0.7 }}>
        Genre Distribution
      </Typography>
      <Stack direction="row" spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#6366f1', boxShadow: '0 0 10px #6366f1' }} />
          <Box sx={{ width: 30, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ec4899', boxShadow: '0 0 10px #ec4899' }} />
          <Box sx={{ width: 30, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
        </Stack>
      </Stack>
    </Stack>

    {/* Divider */}
    <Box sx={{ width: '1px', height: 24, bgcolor: 'rgba(255,255,255,0.1)' }} />

    {/* View Toggle Visual - Replaces "Map" Button */}
    <Stack spacing={0.5} alignItems="center">
      <Typography level="body-xs" textColor="common.white" fontWeight="lg" letterSpacing="1px" fontSize="10px" textTransform="uppercase" sx={{ opacity: 0.7 }}>
        View
      </Typography>
      <Stack direction="row" spacing={1} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '20px', p: 0.5 }}>
        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'white' }} />
        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }} />
      </Stack>
    </Stack>
  </Stack>
);

export default function Mockup() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#000',
        color: 'common.white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 120%, #151520 0%, #000000 70%)'
      }}
    >

      {/* Background World Map - Abstracted */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ opacity: 0.2, color: 'white', filter: 'blur(1px)' }}>
          <GiEarthAmerica size={350} />
        </Box>
      </Box>

      {/* Top Controller - Replacing Buttons with Interactive Visuals */}
      <FloatingPanel
        sx={{
          top: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          px: 3, py: 1.5
        }}
      >
        <VisualFilterLegend />
      </FloatingPanel>

      {/* Left Panel - Projection (Scatter) */}
      <FloatingPanel sx={{ left: '3rem', top: '25%', width: '280px', height: '280px' }}>
        <FakeScatterPlot />
      </FloatingPanel>

      {/* Right Panel - Insights */}
      <FloatingPanel sx={{ right: '3rem', top: '25%', width: '280px', height: '280px', display: 'flex', alignItems: 'center' }}>
        <FakeInsights />
      </FloatingPanel>

      {/* Bottom Panel - Timeline */}
      <FloatingPanel sx={{ bottom: '3rem', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '140px', px: 3, pb: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <FakeChronogram />
      </FloatingPanel>
    </Box>
  );
}
