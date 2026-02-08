import { Box, Slider, Stack, Typography } from '@mui/joy'
import { useFilters } from '../store/hooks'

function TimelineSelector() {
    const { timeSpan, updateTimeSpan } = useFilters();

    const handleChange = (event, newValue) => {
        updateTimeSpan(newValue);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            px: 6
        }}>
            <Typography level="body-xs" textColor="common.white" sx={{ mb: 2, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Time Span: {timeSpan[0]} — {timeSpan[1]}
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 600 }}>
                <Slider
                    value={timeSpan}
                    onChange={handleChange}
                    step={5}
                    min={1980}
                    max={2020}
                    marks
                    valueLabelDisplay="on"
                    sx={{
                        '--Slider-trackSize': '6px',
                        '--Slider-thumbSize': '16px',
                        color: 'primary.solidBg'
                    }}
                />
            </Box>
        </Box>
    );
}

export default TimelineSelector;