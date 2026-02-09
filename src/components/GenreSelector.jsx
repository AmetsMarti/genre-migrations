import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/joy';
import { useFilters, useData } from '../store/hooks';

const GenreSelector = () => {
    const { genreList } = useData();
    const { selectedGenre, updateGenre } = useFilters();

    return (
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
            {genreList.map((genre) => (
                <Button
                    key={genre}
                    size="sm"
                    variant={selectedGenre === genre ? "soft" : "plain"}
                    color={selectedGenre === genre ? "primary" : "neutral"}
                    onClick={() => updateGenre(genre)}
                    sx={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: selectedGenre === genre ? 700 : 500,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {genre}
                </Button>
            ))}
        </Stack>
    );
};

export default GenreSelector;