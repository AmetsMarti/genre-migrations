import { Box, Button, Stack, Typography } from "@mui/joy";
import { useFilters, useData } from "../store/hooks";

function GenreSelector() {
    const { genreList } = useData();
    const { selectedGenre, updateGenre } = useFilters();

    return (
        <Box>
            <Typography variant="h6">Genre: {selectedGenre || 'None'}</Typography>
            <Stack direction="row" spacing={2}>
                {genreList.length > 0 ?
                    genreList.map((genre) => (
                        <Button
                            key={genre}
                            onClick={() => updateGenre(genre)}
                            variant={genre === selectedGenre ? 'solid' : 'outlined'}
                        >
                            {genre}
                        </Button>
                    ))
                    : <Typography variant="h6">No genres available</Typography>}
            </Stack>
        </Box>
    )
}

export default GenreSelector;