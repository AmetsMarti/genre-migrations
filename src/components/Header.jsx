import { Box, Typography } from '@mui/joy';


function Header(genreList, timespan, isLoad = false) {
    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
            }}>
                <Typography level="h1">Genre Migrations</Typography>
                {
                    isLoad ? genreList.map(genre => {
                        return genre
                    }) : null
                }
                {
                    timespan ?
                        <Typography level="h2">{timespan[0]} - {timespan[1]}</Typography>
                        : null
                }
            </Box>
        </>
    )
}

export default Header