import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Receipt,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { transactionService, categoryService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/helpers';
import TransactionForm from '@/components/TransactionForm';
import CustomLoader from '@/components/CustomLoader';
import EmptyState from '@/components/EmptyState';
import { Transaction, Category } from '@/types/models';

interface TransactionFilters {
  search: string;
  type: string;
  categoryId: string;
  period: 'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

interface ModernTransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const ModernTransactionCard: React.FC<ModernTransactionCardProps> = ({ 
  transaction, 
  onEdit, 
  onDelete 
}) => {
  const isIncome = transaction.type === 'income';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: isIncome 
              ? 'linear-gradient(180deg, #10B981 0%, #34D399 100%)'
              : 'linear-gradient(180deg, #EF4444 0%, #F87171 100%)',
          },
        }}
      >
        <CardContent sx={{ pl: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: isIncome ? 'success.50' : 'error.50',
                  color: isIncome ? 'success.main' : 'error.main',
                  background: isIncome
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%)',
                }}
              >
                {isIncome ? <TrendingUp /> : <TrendingDown />}
              </Avatar>
              
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {transaction.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    label={transaction.category?.name || 'Sem categoria'}
                    size="small"
                    sx={{
                      bgcolor: transaction.category?.color ? `${transaction.category.color}20` : 'grey.100',
                      color: transaction.category?.color || 'text.secondary',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(transaction.date)}
                  </Typography>
                </Stack>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Box textAlign="right" mr={2}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={isIncome ? 'success.main' : 'error.main'}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(transaction.date).format('HH:mm')}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={0.5}>
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(transaction)}
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.50' }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(transaction)}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.50' }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Transactions: React.FC = () => {
  const isClient = typeof window !== 'undefined';
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: '',
    categoryId: '',
    period: 'all',
    startDate: null,
    endDate: null
  });

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadTransactions = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };

      if (filters.startDate) {
        params.startDate = dayjs(filters.startDate).format('YYYY-MM-DD');
      }
      if (filters.endDate) {
        params.endDate = dayjs(filters.endDate).format('YYYY-MM-DD');
      }

      const response = await transactionService.getAll(params);
      
      // API retorna { transactions, pagination }
      const transactionsData = response.transactions || [];
      const paginationData = response.pagination || { totalItems: 0 };
      
      setTransactions(transactionsData);
      setTotalItems(paginationData.totalItems);

    } catch (err: any) {
      const errorMessage = 'Erro ao carregar transações';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const loadCategories = async (): Promise<void> => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const handleFilterChange = <K extends keyof TransactionFilters>(
    field: K, 
    value: TransactionFilters[K]
  ): void => {
    const newFilters = {
      ...filters,
      [field]: value
    };

    if (field === 'period') {
      const now = dayjs();
      const periodValue = value as TransactionFilters['period'];
      
      switch (periodValue) {
        case 'daily':
          newFilters.startDate = now.startOf('day');
          newFilters.endDate = now.endOf('day');
          break;
        case 'weekly':
          newFilters.startDate = now.startOf('week');
          newFilters.endDate = now.endOf('week');
          break;
        case 'monthly':
          newFilters.startDate = now.startOf('month');
          newFilters.endDate = now.endOf('month');
          break;
        case 'quarterly':
          newFilters.startDate = now.startOf('month').subtract(2, 'month');
          newFilters.endDate = now.endOf('month');
          break;
        case 'yearly':
          newFilters.startDate = now.startOf('year');
          newFilters.endDate = now.endOf('year');
          break;
        case 'all':
          newFilters.startDate = null;
          newFilters.endDate = null;
          break;
      }
    }

    setFilters(newFilters);
    setPage(0);
  };

  const clearFilters = (): void => {
    setFilters({
      search: '',
      type: '',
      categoryId: '',
      period: 'all',
      startDate: null,
      endDate: null
    });
    setPage(0);
  };

  const handleEdit = (transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (!transactionToDelete) return;

    try {
      await transactionService.delete(transactionToDelete.id);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      toast.success('Transação excluída com sucesso!');
      loadTransactions();
    } catch (err: any) {
      const errorMessage = 'Erro ao excluir transação';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erro ao excluir transação:', err);
    }
  };

  const handleModalClose = (): void => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleTransactionSaved = (): void => {
    handleModalClose();
    toast.success(editingTransaction ? 'Transação atualizada!' : 'Transação criada com sucesso!');
    loadTransactions();
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <CustomLoader message="Carregando transações..." />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight={700}>
              Transações
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setModalOpen(true)}
                sx={{ py: 1.2 }}
              >
                Nova Transação
              </Button>
            </motion.div>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filters.type}
                    onChange={(e: SelectChangeEvent) => handleFilterChange('type', e.target.value)}
                    label="Tipo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="income">Receitas</MenuItem>
                    <MenuItem value="expense">Despesas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filters.categoryId}
                    onChange={(e: SelectChangeEvent) => handleFilterChange('categoryId', e.target.value)}
                    label="Categoria"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={filters.period}
                    onChange={(e: SelectChangeEvent) => 
                      handleFilterChange('period', e.target.value as TransactionFilters['period'])
                    }
                    label="Período"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="daily">Hoje</MenuItem>
                    <MenuItem value="weekly">Esta Semana</MenuItem>
                    <MenuItem value="monthly">Este Mês</MenuItem>
                    <MenuItem value="quarterly">Este Trimestre</MenuItem>
                    <MenuItem value="yearly">Este Ano</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Data Inicial"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  format="DD/MM/YY"
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Data Final"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  format="DD/MM/YY"
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={1}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<FilterList />}
                >
                  Limpar
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma transação encontrada"
              message="Adicione sua primeira transação para começar a controlar suas finanças"
              actionLabel="Nova Transação"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            <Box>
              <AnimatePresence>
                {transactions.map((transaction) => (
                  <ModernTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                    onDelete={(transaction) => {
                      setTransactionToDelete(transaction);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </AnimatePresence>
              
              <Paper sx={{ mt: 2, p: 2 }}>
                <TablePagination
                  component="div"
                  count={totalItems}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Itens por página:"
                />
              </Paper>
            </Box>
          )}

          {isClient && (
            <>
              <Dialog
                open={modalOpen}
                onClose={handleModalClose}
                maxWidth="sm"
                fullWidth
                disablePortal
                disableScrollLock
              >
                <DialogTitle>
                  {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                </DialogTitle>
                <DialogContent>
                  <TransactionForm
                    transaction={editingTransaction}
                    categories={categories}
                    onSave={handleTransactionSaved}
                    onCancel={handleModalClose}
                  />
                </DialogContent>
              </Dialog>

              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                disablePortal
                disableScrollLock
              >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                  <Typography>
                    Tem certeza que deseja excluir a transação "{transactionToDelete?.description}"?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleDelete} color="error" variant="contained">
                    Excluir
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
};

export default Transactions;
