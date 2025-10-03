import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { transactionService, categoryService } from '../services';
import { formatCurrency, formatDate, getTransactionTypeLabel } from '../utils/helpers';
import TransactionForm from '../components/TransactionForm';

const TransactionsDebug = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    categoryId: '',
    startDate: null,
    endDate: null
  });

  // Debug logs
  const [debugLogs, setDebugLogs] = useState([]);

  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, message, data }]);
    console.log(`[DEBUG ${timestamp}] ${message}`, data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
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

      addDebugLog('Chamando API com parâmetros:', params);

      const response = await transactionService.getAll(params);
      
      addDebugLog('Resposta da API:', {
        transactionCount: response.transactions.length,
        totalItems: response.pagination.totalItems
      });

      setTransactions(response.transactions);
      setTotalItems(response.pagination.totalItems);

    } catch (err) {
      setError('Erro ao carregar transações');
      addDebugLog('Erro ao carregar transações:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const loadCategories = async () => {
    try {
      addDebugLog('Carregando categorias...');
      const response = await categoryService.getAll();
      setCategories(response.categories);
      addDebugLog('Categorias carregadas:', response.categories.map(c => ({ id: c.id, name: c.name, type: c.type })));
    } catch (err) {
      addDebugLog('Erro ao carregar categorias:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    addDebugLog(`Alterando filtro ${field}:`, { field, value, previousValue: filters[field] });
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value
      };
      addDebugLog('Novos filtros:', newFilters);
      return newFilters;
    });
    
    setPage(0); // Reset para primeira página quando filtrar
    addDebugLog('Página resetada para 0');
  };

  const clearFilters = () => {
    addDebugLog('Limpando filtros');
    setFilters({
      search: '',
      type: '',
      categoryId: '',
      startDate: null,
      endDate: null
    });
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    addDebugLog('Mudando página:', { from: page, to: newPage });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    addDebugLog('Mudando itens por página:', { from: rowsPerPage, to: newRowsPerPage });
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const getTypeChip = (type) => (
    <Chip
      label={getTransactionTypeLabel(type)}
      color={type === 'income' ? 'success' : 'error'}
      size="small"
    />
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Transações (Debug Mode)
          </Typography>
        </Box>

        {/* Debug Panel */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <Typography variant="body2" gutterBottom>
            Filtros Atuais: {JSON.stringify(filters)}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Total de Transações: {totalItems}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Categorias Carregadas: {categories.length}
          </Typography>
          
          <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 2 }}>
            <Typography variant="subtitle2">Últimos logs:</Typography>
            {debugLogs.slice(-10).map((log, index) => (
              <Typography key={index} variant="caption" display="block">
                [{log.timestamp}] {log.message} {log.data && JSON.stringify(log.data)}
              </Typography>
            ))}
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
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
                  onChange={(e) => handleFilterChange('type', e.target.value)}
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
                  onChange={(e) => {
                    addDebugLog('Select onChange triggered:', { 
                      value: e.target.value,
                      categories: categories.map(c => ({ id: c.id, name: c.name }))
                    });
                    handleFilterChange('categoryId', e.target.value);
                  }}
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

        {/* Tabela */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: transaction.category.color,
                              mr: 1
                            }}
                          />
                          {transaction.category.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getTypeChip(transaction.type)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
    </LocalizationProvider>
  );
};

export default TransactionsDebug;