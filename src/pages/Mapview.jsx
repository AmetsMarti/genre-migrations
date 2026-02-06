import React from 'react';
import Mockup from './Mockup';
import fetchTimeSpanGenres from '../fetch_books';
import Header from '../components/Header';
import { useState, useEffect } from 'react';

import { Box, Typography, Footer } from '@mui/joy';

function Mapview() {
  const [genre, setGenre] = useState("Book");
  const [timeSpan, setTimeSpan] = useState([1900, 2020]);
  const [isLoad, setIsLoad] = useState(false);
  const [genreList, setGenreList] = useState([]);

  useEffect(() => {
    fetchTimeSpanGenres(timeSpan[0], timeSpan[1]).then(setGenreList);
    setIsLoad(true);
  }, [timeSpan]);



  return (
    <>
      <Header genreList={genreList} timespan={timeSpan} isLoad={isLoad} />
      <Footer>
        <Typography>Footer</Typography>
      </Footer>
    </>
  )




}

export default Mapview;
