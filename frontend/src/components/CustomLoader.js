import { Box, Typography } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { motion } from 'framer-motion';

const CustomLoader = ({ message = 'Carregando seus dados...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: 2,
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <AccountBalanceWallet 
        sx={{ 
          fontSize: 60, 
          color: 'primary.main',
        }} 
      />
    </motion.div>
    <Typography variant="body1" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default CustomLoader;
