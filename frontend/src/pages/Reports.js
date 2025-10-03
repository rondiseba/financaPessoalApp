import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import {
  GetApp,
  PictureAsPdf,
  TableChart,
  Delete,
  Refresh
} from '@mui/icons-material';
import { reportService } from '../services';
import { getCurrentMonth, getCurrentYear, getMonthName } from '../utils/helpers';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportService.list();
      setReports(response.reports);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    }
  };

  const generateReport = async (type) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (type === 'excel') {
        response = await reportService.generateExcel(selectedMonth, selectedYear);
      } else {
        response = await reportService.generatePDF(selectedMonth, selectedYear);
      }

      setSuccess(`Relatório ${type.toUpperCase()} gerado com sucesso!`);
      loadReports(); // Recarregar lista de relatórios

      // Abrir relatório em nova aba
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${response.downloadUrl}`;
      window.open(url, '_blank');

    } catch (err) {
      setError(`Erro ao gerar relatório ${type.toUpperCase()}: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (fileName) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      await reportService.delete(fileName);
      setSuccess('Relatório excluído com sucesso!');
      loadReports();
    } catch (err) {
      setError(`Erro ao excluir relatório: ${err.response?.data?.error || err.message}`);
    }
  };

  const downloadReport = async (fileName) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/reports/download/${fileName}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer download');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Erro ao fazer download: ${err.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getYearOptions = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1)
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relatórios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Geração de Relatórios */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gerar Novo Relatório
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Mês</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Mês"
              >
                {getMonthOptions().map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Ano"
              >
                {getYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<TableChart />}
                onClick={() => generateReport('excel')}
                disabled={loading}
                fullWidth
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={() => generateReport('pdf')}
                disabled={loading}
                fullWidth
              >
                PDF
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Selecione o mês e ano para gerar um relatório detalhado das suas transações.
          Os relatórios incluem todas as receitas, despesas e um resumo financeiro do período.
        </Typography>
      </Paper>

      {/* Lista de Relatórios Gerados */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Relatórios Gerados
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={loadReports}
            size="small"
          >
            Atualizar
          </Button>
        </Box>

        {reports.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              Nenhum relatório gerado ainda.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Arquivo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Tamanho</TableCell>
                  <TableCell>Data de Criação</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.fileName} hover>
                    <TableCell>
                      {report.displayName || report.fileName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.type}
                        color={report.type === 'PDF' ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatFileSize(report.size)}
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => downloadReport(report.fileName)}
                        title="Download"
                      >
                        <GetApp />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => deleteReport(report.fileName)}
                        title="Excluir"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Informações sobre Relatórios */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sobre os Relatórios
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TableChart color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Relatório Excel</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • Planilha completa com todas as transações<br/>
                  • Dados organizados por data<br/>
                  • Totalizadores automáticos<br/>
                  • Ideal para análises detalhadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <PictureAsPdf color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Relatório PDF</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • Relatório visual formatado<br/>
                  • Resumo financeiro do período<br/>
                  • Gráficos e estatísticas<br/>
                  • Ideal para apresentações
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Reports;