import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { dashboardService, transactionService } from '../services';
import { formatCurrency, formatDate, getColorByType } from '../utils/helpers';
import GlassStatCard from '../components/GlassStatCard';
import CustomLoader from '../components/CustomLoader';
import EmptyState from '../components/EmptyState';
import { TrendData } from '../types/models';
import { DashboardDataResponse } from '../types/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const [dashData, trendData] = await Promise.all([
        dashboardService.getData('current'),
        transactionService.getMonthlyTrend()
      ]);

      setDashboardData(dashData);
      setMonthlyTrend(trendData);
      toast.success('Dashboard atualizado!');

    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard');
      toast.error('Erro ao carregar dados do dashboard');
      console.error('Erro no dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getExpenseChartData = (): ChartData<'doughnut'> | null => {
    if (!dashboardData?.categoryBreakdown?.length) return null;

    const expenses = dashboardData.categoryBreakdown.filter(c => c.totalAmount > 0);
    
    return {
      labels: expenses.map(exp => exp.categoryName),
      datasets: [
        {
          data: expenses.map(exp => exp.totalAmount),
          backgroundColor: expenses.map(exp => exp.color),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  const getTrendChartData = (): ChartData<'line'> | null => {
    if (!monthlyTrend.length) return null;

    return {
      labels: monthlyTrend.map(item => item.period),
      datasets: [
        {
          label: 'Receitas',
          data: monthlyTrend.map(item => item.income),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        },
        {
          label: 'Despesas',
          data: monthlyTrend.map(item => item.expense),
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4
        },
        {
          label: 'Saldo',
          data: monthlyTrend.map(item => item.balance),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  if (loading) {
    return <CustomLoader message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return <EmptyState icon={Receipt} title="Nenhum dado encontrado" message="Adicione transações para visualizar seu dashboard" />;
  }

  const { stats, recentTransactions } = dashboardData;
  const expenseChartData = getExpenseChartData();
  const trendChartData = getTrendChartData();

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    }
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(Number(value))
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Dashboard Financeiro
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Receitas"
              value={formatCurrency(stats.totalIncome)}
              icon={TrendingUp}
              gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
              trend={{ value: 5.2, isPositive: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Despesas"
              value={formatCurrency(stats.totalExpense)}
              icon={TrendingDown}
              gradient="linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
              trend={{ value: 3.1, isPositive: false }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Saldo"
              value={formatCurrency(stats.balance)}
              icon={AccountBalance}
              gradient="linear-gradient(135deg, #6366F1 0%, #818CF8 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Transações"
              value={stats.transactionCount.toString()}
              icon={Receipt}
              gradient="linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Tendência Mensal
              </Typography>
              {trendChartData ? (
                <Box sx={{ height: 320 }}>
                  <Line data={trendChartData} options={lineOptions} />
                </Box>
              ) : (
                <EmptyState 
                  icon={Receipt}
                  title="Sem dados de tendência" 
                  message="Adicione mais transações para visualizar a tendência" 
                />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%', minHeight: 400 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Despesas por Categoria
              </Typography>
              {expenseChartData ? (
                <Box sx={{ height: 320 }}>
                  <Doughnut data={expenseChartData} options={doughnutOptions} />
                </Box>
              ) : (
                <EmptyState 
                  icon={Receipt}
                  title="Sem despesas" 
                  message="Nenhuma despesa registrada ainda" 
                />
              )}
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Transações Recentes
          </Typography>
          {recentTransactions && recentTransactions.length > 0 ? (
            <Box>
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: getColorByType(transaction.type)
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {transaction.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.category?.name || 'Sem categoria'} • {formatDate(transaction.date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        size="small"
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          ) : (
            <EmptyState
              icon={Receipt}
              title="Nenhuma transação recente"
              message="Suas transações mais recentes aparecerão aqui"
            />
          )}
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Dashboard;
