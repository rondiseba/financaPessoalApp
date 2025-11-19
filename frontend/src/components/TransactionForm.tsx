import React, { useState, useEffect, FormEvent } from 'react';
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
  Collapse,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { transactionService } from '@/services';
import { Transaction, Category } from '@/types/models';

dayjs.extend(customParseFormat);
dayjs.locale('pt-br');

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  date: Dayjs;
  categoryId: string;
  isRecurring: boolean;
  recurringDay: number;
}

interface FormErrors {
  description?: string;
  amount?: string;
  categoryId?: string;
  date?: string;
  recurringDay?: string;
}

interface AlertState {
  show: boolean;
  message: string;
  severity: 'error' | 'success' | 'info' | 'warning';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  transaction, 
  categories, 
  onSave, 
  onCancel 
}) => {
  const isClient = typeof window !== 'undefined';
  
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    type: 'expense',
    date: dayjs(),
    categoryId: '',
    isRecurring: false,
    recurringDay: dayjs().date()
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState>({ 
    show: false, 
    message: '', 
    severity: 'error' 
  });

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

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.isRecurring && !formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (formData.isRecurring && !formData.recurringDay) {
      newErrors.recurringDay = 'Dia do vencimento é obrigatório';
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
      const transactionData: any = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId,
        isRecurring: formData.isRecurring,
        recurringDay: formData.isRecurring ? formData.recurringDay : null
      };

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

    } catch (error: any) {
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
              handleChange('type', e.target.value as 'income' | 'expense');
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
            onChange={(e: SelectChangeEvent) => handleChange('categoryId', e.target.value)}
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

        {formData.isRecurring ? (
          <TextField
            fullWidth
            label="Data"
            value="Data calculada automaticamente"
            margin="normal"
            disabled
            helperText="A data será calculada automaticamente baseada no dia do vencimento"
          />
        ) : (
          isClient ? (
            <DatePicker
              label="Data"
              value={formData.date}
              onChange={(date: Dayjs | null) => handleChange('date', date || dayjs())}
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
                    zIndex: 1400
                  }
                }
              }}
              maxDate={dayjs()}
            />
          ) : (
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
                  onChange={(e: SelectChangeEvent<number>) => 
                    handleChange('recurringDay', e.target.value as number)
                  }
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
