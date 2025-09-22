import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  AttachMoney,
  SavingsOutlined
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import { dashboardService, transactionService } from '../services';
import { formatCurrency, formatDate, getColorByType } from '../utils/helpers';

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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashData, trendData] = await Promise.all([
        dashboardService.getData('current'),
        transactionService.getMonthlyTrend({ months: 6 })
      ]);

      setDashboardData(dashData);
      setMonthlyTrend(trendData.trend);

    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro no dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="h2" color={color}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend.direction === 'up' ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography variant="body2" color={trend.direction === 'up' ? 'success.main' : 'error.main'}>
                  {trend.percentage}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box>
            {React.cloneElement(icon, { 
              sx: { fontSize: 40, color: color === 'error.main' ? 'error.main' : 'primary.main' } 
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getExpenseChartData = () => {
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

  const getTrendChartData = () => {
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Nenhum dado encontrado
      </Alert>
    );
  }

  const { totalStats, categoryStats, recentTransactions } = dashboardData;
  const expenseChartData = getExpenseChartData();
  const trendChartData = getTrendChartData();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Financeiro
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Receitas"
            value={formatCurrency(totalStats.totalIncome)}
            icon={<TrendingUp />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Despesas"
            value={formatCurrency(totalStats.totalExpense)}
            icon={<TrendingDown />}
            color="error.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo"
            value={formatCurrency(totalStats.balance)}
            icon={<AccountBalance />}
            color={totalStats.balance >= 0 ? 'success.main' : 'error.main'}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transações"
            value={totalStats.transactionCount}
            icon={<Receipt />}
            color="primary.main"
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
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (value) => formatCurrency(value)
                        }
                      }
                    }
                  }}
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
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = formatCurrency(context.raw);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
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
  );
};

export default Dashboard;