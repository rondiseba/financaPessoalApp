import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add, Receipt } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { EmptyStateProps } from '../types';

/**
 * Empty state component with animated icon and optional action button
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = Receipt,
  title = 'Nenhum dado encontrado',
  message = 'Comece adicionando seu primeiro registro',
  actionLabel = 'Adicionar',
  onAction
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 3,
      textAlign: 'center',
    }}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
        }}
      >
        <Icon sx={{ fontSize: 60, color: 'white' }} />
      </Box>
    </motion.div>
    
    <Typography variant="h5" gutterBottom fontWeight={600}>
      {title}
    </Typography>
    
    <Typography 
      variant="body1" 
      color="text.secondary" 
      sx={{ mb: 3, maxWidth: 400 }}
    >
      {message}
    </Typography>
    
    {onAction && (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={onAction}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
          }}
        >
          {actionLabel}
        </Button>
      </motion.div>
    )}
  </Box>
);

export default EmptyState;
