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
import { DashboardStats, TrendData, Transaction, CategoryStats } from '../types/models';
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

/**
 * Componente da página de Dashboard
 * Exibe visão geral financeira, gráficos e transações recentes
 * 
 * @returns JSX.Element
 */
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Carrega os dados do dashboard e tendências mensais
   */
  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const [dashData, trendData] = await Promise.all([
        dashboardService.getData('current'),
        transactionService.getMonthlyTrend({ months: 6 })
      ]);

      setStats(dashData.stats);
      setRecentTransactions(dashData.recentTransactions);
      setCategoryStats(dashData.categoryBreakdown);
      setMonthlyTrend(trendData.trend);
      toast.success('Dashboard atualizado!');

    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard');
      toast.error('Erro ao carregar dados do dashboard');
      console.error('Erro no dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gera dados para o gráfico de despesas por categoria
   * @returns Dados formatados para o Chart.js ou null
   */
  const getExpenseChartData = (): ChartData<'doughnut'> | null => {
    if (!dashboardData?.categoryStats?.expenses?.length) return null;

    const expenses = dashboardData.categoryStats.expenses;
    
    return {
      labels: expenses.map(exp => exp.category.name),
      datasets: [
        {
          data: expenses.map(exp => exp._sum.amount),
          backgroundColor: expenses.map(exp => exp.category.color),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  /**
   * Gera dados para o gráfico de tendência mensal
   * @returns Dados formatados para o Chart.js ou null
   */
  const getTrendChartData = (): ChartData<'line'> | null => {
    if (!monthlyTrend.length) return null;

    return {
      labels: monthlyTrend.map(item => item.month),
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
    return <EmptyState title="Nenhum dado encontrado" message="Adicione transações para visualizar seu dashboard" />;
  }

  const { totalStats, recentTransactions } = dashboardData;
  const expenseChartData = getExpenseChartData();
  const trendChartData = getTrendChartData();

  // Opções para o gráfico de linha
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw as number)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => formatCurrency(Number(value))
        }
      }
    }
  };

  // Opções para o gráfico de rosca
  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const label = context.label || '';
            const value = formatCurrency(context.raw as number);
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = (((context.raw as number) / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Dashboard Financeiro
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Receitas"
              value={formatCurrency(totalStats?.totalIncome || 0)}
              icon={<TrendingUp />}
              gradient="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Despesas"
              value={formatCurrency(totalStats?.totalExpense || 0)}
              icon={<TrendingDown />}
              gradient="linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Saldo"
              value={formatCurrency(totalStats?.balance || 0)}
              icon={<AccountBalance />}
              gradient={(totalStats?.balance || 0) >= 0 
                ? "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)"
                : "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
              }
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <GlassStatCard
              title="Transações"
              value={String(totalStats?.transactionCount || 0)}
              icon={<Receipt />}
              gradient="linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Gráfico de Tendência */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Tendência dos Últimos 6 Meses
              </Typography>
              {trendChartData ? (
                <Box sx={{ height: '320px' }}>
                  <Line 
                    data={trendChartData} 
                    options={lineChartOptions}
                  />
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="320px">
                  <Typography color="textSecondary">
                    Sem dados suficientes para exibir o gráfico
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Gráfico de Despesas por Categoria */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Despesas por Categoria
              </Typography>
              {expenseChartData ? (
                <Box sx={{ height: '320px', display: 'flex', justifyContent: 'center' }}>
                  <Doughnut 
                    data={expenseChartData}
                    options={doughnutChartOptions}
                  />
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="320px">
                  <Typography color="textSecondary">
                    Nenhuma despesa encontrada
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Transações Recentes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transações Recentes
              </Typography>
              {recentTransactions?.length > 0 ? (
                <Box>
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <Box
                      key={transaction.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                      borderBottom="1px solid #eee"
                    >
                      <Box>
                        <Typography variant="body1">
                          {transaction.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {transaction.category.name} • {formatDate(transaction.date)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                        <Typography
                          variant="h6"
                          color={getColorByType(transaction.type)}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  Nenhuma transação encontrada
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default Dashboard;
