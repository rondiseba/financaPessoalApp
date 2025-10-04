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
  InputAdornment,
  Checkbox,
  Typography,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { transactionService } from '../services';

dayjs.extend(customParseFormat);
dayjs.locale('pt-br');

const TransactionForm = ({ transaction, categories, onSave, onCancel }) => {
  // Verificação de ambiente do navegador
  const isClient = typeof window !== 'undefined';
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: dayjs(),
    categoryId: '',
    isRecurring: false,
    recurringDay: dayjs().date()
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
        date: dayjs(transaction.date),
        categoryId: transaction.categoryId,
        isRecurring: transaction.isRecurring || false,
        recurringDay: transaction.recurringDay || dayjs().date()
      });
    }
  }, [transaction]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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

    // Data só é obrigatória se não for transação recorrente
    if (!formData.isRecurring && !formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    // Se for transação recorrente, precisa ter o dia
    if (formData.isRecurring && !formData.recurringDay) {
      newErrors.recurringDay = 'Dia do vencimento é obrigatório';
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
        categoryId: formData.categoryId,
        isRecurring: formData.isRecurring,
        recurringDay: formData.isRecurring ? formData.recurringDay : null
      };

      // Só inclui a data se não for transação recorrente
      if (!formData.isRecurring) {
        transactionData.date = formData.date.toISOString();
      }

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

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            {filteredCategories.length === 0 ? (
              <MenuItem disabled>
                {categories.length === 0 
                  ? 'Carregando categorias...' 
                  : `Nenhuma categoria de ${formData.type === 'income' ? 'receita' : 'despesa'} encontrada`
                }
              </MenuItem>
            ) : (
              filteredCategories.map((category) => (
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
              ))
            )}
          </Select>
          {errors.categoryId && (
            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
              {errors.categoryId}
            </Box>
          )}
        </FormControl>

        {/* Campo de Data - Condicional baseado em isRecurring */}
        {formData.isRecurring ? (
          // Para transações recorrentes, usa TextField simples (desabilitado)
          <TextField
            fullWidth
            label="Data"
            value="Data calculada automaticamente"
            margin="normal"
            disabled
            helperText="A data será calculada automaticamente baseada no dia do vencimento"
          />
        ) : (
          // Para transações normais
          isClient ? (
            // DatePicker completo no cliente
            <DatePicker
              label="Data"
              value={formData.date}
              onChange={(date) => handleChange('date', date)}
              format="DD/MM/YY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  error: !!errors.date,
                  helperText: errors.date,
                  disabled: loading
                },
                popper: {
                  disablePortal: true
                },
                desktopPaper: {
                  sx: { 
                    zIndex: 1400 // Garante que fica acima de outros elementos
                  }
                }
              }}
              maxDate={dayjs()}
            />
          ) : (
            // Fallback: TextField simples no server-side
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={formData.date?.format('YYYY-MM-DD') || ''}
              onChange={(e) => handleChange('date', dayjs(e.target.value))}
              margin="normal"
              error={!!errors.date}
              helperText={errors.date}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          )
        )}

        {/* Opção de Gasto Fixo */}
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isRecurring}
                onChange={(e) => {
                  handleChange('isRecurring', e.target.checked);
                  if (e.target.checked) {
                    handleChange('recurringDay', dayjs().date());
                  }
                }}
                disabled={loading}
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {formData.type === 'expense' ? 'Esta é uma despesa fixa?' : 'Esta é uma receita fixa?'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.type === 'expense' 
                    ? 'Despesas fixas se repetem todo mês no mesmo dia'
                    : 'Receitas fixas se repetem todo mês no mesmo dia'
                  }
                </Typography>
              </Box>
            }
          />

          <Collapse in={formData.isRecurring}>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth error={!!errors.recurringDay}>
                <InputLabel>Dia do vencimento</InputLabel>
                <Select
                  value={formData.recurringDay}
                  onChange={(e) => handleChange('recurringDay', e.target.value)}
                  label="Dia do vencimento"
                  disabled={loading}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <MenuItem key={day} value={day}>
                      Dia {day}
                    </MenuItem>
                  ))}
                </Select>
                {errors.recurringDay && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                    {errors.recurringDay}
                  </Box>
                )}
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {formData.type === 'expense' 
                  ? 'Esta despesa será repetida automaticamente todo dia ' + formData.recurringDay
                  : 'Esta receita será repetida automaticamente todo dia ' + formData.recurringDay
                }
              </Typography>
            </Box>
          </Collapse>
        </Box>

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