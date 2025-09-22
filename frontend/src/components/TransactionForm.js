import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import moment from 'moment';
import { transactionService } from '../services';

const TransactionForm = ({ transaction, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: moment(),
    categoryId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'error' });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        date: moment(transaction.date),
        categoryId: transaction.categoryId
      });
    }
  }, [transaction]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: '', severity: 'error' });

    try {
      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date.toISOString(),
        categoryId: formData.categoryId
      };

      if (transaction) {
        await transactionService.update(transaction.id, transactionData);
        setAlert({
          show: true,
          message: 'Transação atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await transactionService.create(transactionData);
        setAlert({
          show: true,
          message: 'Transação criada com sucesso!',
          severity: 'success'
        });
      }

      setTimeout(() => {
        onSave();
      }, 1000);

    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.error || 'Erro ao salvar transação',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias pelo tipo selecionado
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
        {alert.show && (
          <Alert 
            severity={alert.severity} 
            sx={{ mb: 2 }}
            onClose={() => setAlert({ ...alert, show: false })}
          >
            {alert.message}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Descrição"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          margin="normal"
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Valor"
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          error={!!errors.amount}
          helperText={errors.amount}
          margin="normal"
          inputProps={{
            min: "0",
            step: "0.01"
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
          }}
          disabled={loading}
        />

        <FormControl component="fieldset" margin="normal" fullWidth>
          <FormLabel component="legend">Tipo</FormLabel>
          <RadioGroup
            row
            value={formData.type}
            onChange={(e) => {
              handleChange('type', e.target.value);
              // Limpar categoria quando mudar o tipo
              handleChange('categoryId', '');
            }}
          >
            <FormControlLabel 
              value="income" 
              control={<Radio color="success" />} 
              label="Receita"
              disabled={loading}
            />
            <FormControlLabel 
              value="expense" 
              control={<Radio color="error" />} 
              label="Despesa"
              disabled={loading}
            />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Categoria</InputLabel>
          <Select
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            error={!!errors.categoryId}
            label="Categoria"
            disabled={loading}
          >
            {filteredCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      mr: 1
                    }}
                  />
                  {category.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.categoryId && (
            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
              {errors.categoryId}
            </Box>
          )}
        </FormControl>

        <DatePicker
          label="Data"
          value={formData.date}
          onChange={(date) => handleChange('date', date)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              margin="normal"
              error={!!errors.date}
              helperText={errors.date}
              disabled={loading}
            />
          )}
          maxDate={moment()}
        />

        <Box display="flex" gap={2} mt={3} justifyContent="flex-end">
          <Button
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Criar')}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionForm;