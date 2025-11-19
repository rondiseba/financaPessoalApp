import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Payment,
  CalendarMonth,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { recurringService, categoryService } from '@/services';
import { formatCurrency } from '@/utils/helpers';
import CustomLoader from '@/components/CustomLoader';
import EmptyState from '@/components/EmptyState';
import { RecurringTransaction, Category } from '@/types/models';

interface RecurringCardProps {
  recurring: RecurringTransaction;
  onEdit: (recurring: RecurringTransaction) => void;
  onDelete: (recurring: RecurringTransaction) => void;
  onRegisterPayment: (recurring: RecurringTransaction) => void;
}

interface FormData {
  description: string;
  amount: string;
  categoryId: string;
  recurringDay: number;
  type: 'income' | 'expense';
}

interface PaymentData {
  amount: string;
  date: string;
}

const RecurringCard: React.FC<RecurringCardProps> = ({ 
  recurring, 
  onEdit, 
  onDelete, 
  onRegisterPayment 
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        sx={{
          p: 3,
          height: '100%',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(99, 102, 241, 0.3)'
                : '0 8px 24px rgba(99, 102, 241, 0.15)',
          },
        }}
      >
        {/* Header com tipo */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {recurring.type === 'expense' ? (
              <TrendingDown sx={{ color: '#ef4444', fontSize: 28 }} />
            ) : (
              <TrendingUp sx={{ color: '#10b981', fontSize: 28 }} />
            )}
            <Chip
              label={recurring.type === 'expense' ? 'Despesa' : 'Receita'}
              size="small"
              color={recurring.type === 'expense' ? 'error' : 'success'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Typography variant="h5" fontWeight="700" color="primary">
            {formatCurrency(recurring.amount)}
          </Typography>
        </Box>

        {/* Descrição */}
        <Typography variant="h6" fontWeight="600" mb={1}>
          {recurring.description}
        </Typography>

        {/* Categoria */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: recurring.category?.color || '#2196F3',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {recurring.category?.name || 'Categoria'}
          </Typography>
        </Box>

        {/* Dia do vencimento */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CalendarMonth sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Vencimento
            </Typography>
            <Typography variant="body2" fontWeight="600">
              Todo dia {recurring.recurringDay}
            </Typography>
          </Box>
        </Box>

        {/* Ações */}
        <Box display="flex" gap={1}>
          <Tooltip title="Registrar pagamento">
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={() => onRegisterPayment(recurring)}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
              }}
            >
              Pagar
            </Button>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => onEdit(recurring)}
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              color="error"
              onClick={() => onDelete(recurring)}
              sx={{
                border: '1px solid',
                borderColor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </motion.div>
  );
};

const RecurringTransactions: React.FC = () => {
  const isClient = typeof window !== 'undefined';
  
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState<boolean>(false);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    categoryId: '',
    recurringDay: new Date().getDate(),
    type: 'expense'
  });
  
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [recurringData, categoriesResponse] = await Promise.all([
        recurringService.list(),
        categoryService.getAll()
      ]);
      setRecurring(recurringData);
      setCategories(categoriesResponse.categories || []);
    } catch (err: any) {
      toast.error('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (recurringItem: RecurringTransaction | null = null): void => {
    if (recurringItem) {
      setSelectedRecurring(recurringItem);
      setFormData({
        description: recurringItem.description,
        amount: recurringItem.amount.toString(),
        categoryId: recurringItem.categoryId,
        recurringDay: recurringItem.recurringDay,
        type: recurringItem.type
      });
    } else {
      setSelectedRecurring(null);
      setFormData({
        description: '',
        amount: '',
        categoryId: '',
        recurringDay: new Date().getDate(),
        type: 'expense'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedRecurring(null);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!formData.description || !formData.amount || !formData.categoryId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const loadingToast = toast.loading(
        selectedRecurring ? 'Atualizando...' : 'Criando gasto fixo...'
      );

      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (selectedRecurring) {
        await recurringService.update(selectedRecurring.id, dataToSend);
        toast.success('Gasto fixo atualizado!', { id: loadingToast });
      } else {
        await recurringService.create(dataToSend);
        toast.success('Gasto fixo criado!', { id: loadingToast });
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const handleDelete = async (recurringItem: RecurringTransaction): Promise<void> => {
    if (!window.confirm(`Tem certeza que deseja excluir "${recurringItem.description}"?`)) {
      return;
    }

    try {
      const loadingToast = toast.loading('Excluindo...');
      await recurringService.delete(recurringItem.id);
      toast.success('Gasto fixo excluído!', { id: loadingToast });
      loadData();
    } catch (err: any) {
      toast.error('Erro ao excluir');
    }
  };

  const handleOpenPaymentDialog = (recurringItem: RecurringTransaction): void => {
    setSelectedRecurring(recurringItem);
    setPaymentData({
      amount: recurringItem.amount.toString(),
      date: new Date().toISOString().split('T')[0]
    });
    setOpenPaymentDialog(true);
  };

  const handleRegisterPayment = async (): Promise<void> => {
    if (!selectedRecurring) return;

    try {
      const loadingToast = toast.loading('Registrando pagamento...');
      const paymentToSend = {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      };
      await recurringService.registerPayment(selectedRecurring.id, paymentToSend);
      toast.success('Pagamento registrado!', { id: loadingToast });
      setOpenPaymentDialog(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao registrar pagamento');
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const totalExpenses = recurring
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalIncome = recurring
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return <CustomLoader message="Carregando gastos fixos..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Gastos Fixos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gerencie suas despesas e receitas recorrentes
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
              }}
            >
              Novo Gasto Fixo
            </Button>
          </Box>
        </motion.div>

        {/* Cards de resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total de Gastos Fixos
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  {recurring.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  Despesas Mensais
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  {formatCurrency(totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  Receitas Mensais
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  {formatCurrency(totalIncome)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de Gastos Fixos */}
        {recurring.length === 0 ? (
          <EmptyState
            icon={CalendarMonth}
            title="Nenhum gasto fixo cadastrado"
            message="Adicione suas despesas e receitas recorrentes para facilitar o controle"
          />
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              {recurring.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <RecurringCard
                    recurring={item}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                    onRegisterPayment={handleOpenPaymentDialog}
                  />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        {/* Dialogs - só renderiza no cliente */}
        {isClient && (
          <>
            {/* Dialog Criar/Editar */}
            <Dialog 
              open={openDialog} 
              onClose={handleCloseDialog} 
              maxWidth="sm" 
              fullWidth
              disablePortal
              disableScrollLock
            >
              <DialogTitle>
                {selectedRecurring ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Descrição"
                    fullWidth
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <TextField
                    label="Valor"
                    type="number"
                    fullWidth
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    InputProps={{ startAdornment: <span>R$</span> }}
                  />
                  <TextField
                    select
                    label="Tipo"
                    fullWidth
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', categoryId: '' })}
                    SelectProps={{ native: true }}
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </TextField>
                  <TextField
                    select
                    label="Categoria"
                    fullWidth
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Selecione uma categoria</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Dia do Vencimento"
                    fullWidth
                    value={formData.recurringDay}
                    onChange={(e) => setFormData({ ...formData, recurringDay: parseInt(e.target.value) })}
                    SelectProps={{ native: true }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Dia {day}
                      </option>
                    ))}
                  </TextField>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">
                  {selectedRecurring ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog Registrar Pagamento */}
            <Dialog 
              open={openPaymentDialog} 
              onClose={() => setOpenPaymentDialog(false)} 
              maxWidth="sm" 
              fullWidth
              disablePortal
              disableScrollLock
            >
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRecurring?.description}
                  </Typography>
                  <TextField
                    label="Valor"
                    type="number"
                    fullWidth
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    InputProps={{ startAdornment: <span>R$</span> }}
                  />
                  <TextField
                    label="Data do Pagamento"
                    type="date"
                    fullWidth
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPaymentDialog(false)}>Cancelar</Button>
                <Button onClick={handleRegisterPayment} variant="contained">
                  Registrar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </motion.div>
  );
};

export default RecurringTransactions;
