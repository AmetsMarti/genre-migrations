import { Box, Typography } from '@mui/joy';


const Header = () => {
    return (
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 28,
                    height: 28,
                    bgcolor: 'var(--primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.8rem'
                }}>G</Box>
                <Typography level="title-lg" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Genre Migrations
                </Typography>
            </Box>
        </Box>
    );
};

export default Header;