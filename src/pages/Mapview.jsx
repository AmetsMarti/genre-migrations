import React from 'react';
import Mockup from './Mockup';
import fetchTimeSpanGenres from '../fetch_books';
import Header from '../components/Header';
import GenreSelector from '../components/GenreSelector';
import TimelineSelector from '../components/TimelineSelector';
import { useState } from 'react';
import { useFilters, useData } from '../store/hooks';

import { Box, Typography, Stack } from '@mui/joy';

function Mapview() {

  // DATA actions and state
  const { genreList } = useData();

  // FILTER actions and state
  const { timeSpan, selectedGenre } = useFilters();

  return (
    <>
      <Stack direction="row" spacing={2} sx={{
        justifyContent: 'space-between',
        width: '100vw',
        height: '100vh',
        p: "25px"

      }}>

        <Stack spacing={2} sx={{
          justifyContent: 'space-between',
          height: '100%',
          width: "100%",
          borderRadius: "10px",
        }}>

          <GenreSelector />
          <TimelineSelector />
        </Stack>
        <Stack>
          <Box sx={{
            width: "200px",
            borderRadius: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            height: "100%"
          }}>
            Right
          </Box>
        </Stack>

      </Stack >

    </>
  );




}

export default Mapview;
