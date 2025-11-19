import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Container,
  Avatar,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import { AccountBalanceWallet, Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authService } from '../services';
import { validateEmail } from '../utils/helpers';
import { LoginFormData, FormErrors } from '../types';

/**
 * Login page component with form validation and authentication
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ 
    show: boolean; 
    message: string; 
    severity: 'error' | 'success' 
  }>({ 
    show: false, 
    message: '', 
    severity: 'error' 
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: '', severity: 'error' });

    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Login realizado com sucesso!');

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      setAlert({
        show: true,
        message: errorMessage,
        severity: 'error'
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Avatar sx={{ 
                m: 1, 
                width: 64, 
                height: 64,
                background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              }}>
                <AccountBalanceWallet sx={{ fontSize: 36 }} />
              </Avatar>
            </motion.div>
            
            <Typography component="h1" variant="h4" gutterBottom fontWeight={700}>
              Controle de Gastos
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Faça login em sua conta
            </Typography>

            {alert.show && (
              <Alert 
                severity={alert.severity} 
                sx={{ width: '100%', mb: 2 }}
                onClose={() => setAlert({ ...alert, show: false })}
              >
                {alert.message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <motion.div
                style={{ width: '100%' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1rem',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </motion.div>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Link 
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/register');
                    }}
                  >
                    Não tem uma conta? Cadastre-se
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 Controle de Gastos Pessoal
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;
