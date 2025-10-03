import { Card, CardContent, Box, Typography, Avatar, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';

const GlassStatCard = ({ title, value, icon, gradient, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: gradient,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  background: gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                {value}
              </Typography>
              
              {trend && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Chip 
                    icon={trend.direction === 'up' ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                    label={`${trend.percentage}%`}
                    size="small"
                    color={trend.direction === 'up' ? 'success' : 'error'}
                    sx={{ 
                      fontWeight: 600,
                      height: 24,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    vs último mês
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: gradient,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
        
        {/* Animated sparkles effect */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            opacity: 0,
            animation: 'pulse 3s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0 },
              '50%': { opacity: 0.3 },
            },
          }}
        />
      </Card>
    </motion.div>
  );
};

export default GlassStatCard;
