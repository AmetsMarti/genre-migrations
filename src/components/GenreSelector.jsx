import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/joy';
import { useFilters, useData } from '../store/hooks';

const GenreSelector = () => {
    const { genreList } = useData();
    const { selectedGenre, updateGenre } = useFilters();

    return (
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
            <Button
                key={`all-genres`}
                size="sm"
                variant={selectedGenre === null ? "soft" : "plain"}
                color={selectedGenre === null ? "primary" : "neutral"}
                onClick={() => updateGenre(null)}
                sx={{
                    borderRadius: 'var(--radius-md)',
                    fontWeight: selectedGenre === null ? 700 : 500,
                    whiteSpace: 'nowrap'
                }}
            >
                All genres
            </Button>
            {genreList.map((genre, index) => (
                <Button
                    key={`${genre}-${index}`}
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