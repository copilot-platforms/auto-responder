import { Box, CircularProgress } from '@mui/material';

const Loading = () => {
  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress size={40} color="inherit" />
    </Box>
  );
};

export default Loading;
