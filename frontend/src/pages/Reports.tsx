import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  GetApp,
  PictureAsPdf,
  TableChart,
  Delete,
  Refresh,
  Description,
  InsertDriveFile
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { reportService } from '@/services';
import { getCurrentMonth, getCurrentYear, getMonthName } from '@/utils/helpers';
import EmptyState from '@/components/EmptyState';
import { ReportFile } from '@/types/models';

interface MonthOption {
  value: number;
  label: string;
}

interface ModernReportCardProps {
  report: ReportFile;
  onDownload: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

const ModernReportCard: React.FC<ModernReportCardProps> = ({ report, onDownload, onDelete }) => {
  const isPDF = report.type === 'PDF';

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
        {/* Icon and Type */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            {isPDF ? (
              <PictureAsPdf sx={{ fontSize: 40, color: '#ef4444' }} />
            ) : (
              <TableChart sx={{ fontSize: 40, color: '#10b981' }} />
            )}
            <Box>
              <Typography variant="h6" fontWeight="600">
                {report.displayName || report.fileName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(report.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={report.type}
            color={isPDF ? 'error' : 'success'}
            size="small"
            sx={{ fontWeight: '600' }}
          />
        </Box>

        {/* File Info */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            mb: 2,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Tamanho
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {formatFileSize(report.size)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Formato
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {isPDF ? '.pdf' : '.xlsx'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Actions */}
        <Box display="flex" gap={1}>
          <Tooltip title="Baixar relatório">
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={() => onDownload(report.fileName)}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
              }}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Excluir relatório">
            <IconButton
              color="error"
              onClick={() => onDelete(report.fileName)}
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async (): Promise<void> => {
    try {
      const response = await reportService.list();
      setReports(response.reports);
    } catch (err: any) {
      console.error('Erro ao carregar relatórios:', err);
    }
  };

  const generateReport = async (type: 'excel' | 'pdf'): Promise<void> => {
    setLoading(true);

    const loadingToast = toast.loading(`Gerando relatório ${type.toUpperCase()}...`);

    try {
      let response;
      if (type === 'excel') {
        response = await reportService.generateExcel(selectedMonth, selectedYear);
      } else {
        response = await reportService.generatePDF(selectedMonth, selectedYear);
      }

      toast.success(`Relatório ${type.toUpperCase()} gerado com sucesso!`, {
        id: loadingToast,
      });
      loadReports();

      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${response.downloadUrl}`;
      window.open(url, '_blank');

    } catch (err: any) {
      toast.error(`Erro ao gerar relatório: ${err.response?.data?.error || err.message}`, {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (fileName: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    const loadingToast = toast.loading('Excluindo relatório...');

    try {
      await reportService.delete(fileName);
      toast.success('Relatório excluído com sucesso!', { id: loadingToast });
      loadReports();
    } catch (err: any) {
      toast.error(`Erro ao excluir: ${err.response?.data?.error || err.message}`, {
        id: loadingToast,
      });
    }
  };

  const downloadReport = async (fileName: string): Promise<void> => {
    const loadingToast = toast.loading('Preparando download...');

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

      toast.success('Download iniciado!', { id: loadingToast });
    } catch (err: any) {
      toast.error(`Erro ao fazer download: ${err.message}`, { id: loadingToast });
    }
  };

  const getYearOptions = (): number[] => {
    const currentYear = getCurrentYear();
    const years: number[] = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  const getMonthOptions = (): MonthOption[] => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1)
    }));
  };

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
          <Box mb={4}>
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
              Relatórios Financeiros
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gere e gerencie relatórios detalhados das suas transações
            </Typography>
          </Box>
        </motion.div>

        {/* Geração de Relatórios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Description sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Gerar Novo Relatório
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Selecione o período e o formato desejado
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Mês</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e: SelectChangeEvent<number>) => setSelectedMonth(Number(e.target.value))}
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
                    onChange={(e: SelectChangeEvent<number>) => setSelectedYear(Number(e.target.value))}
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
                <Box display="flex" gap={1.5}>
                  <Tooltip title="Gerar planilha Excel">
                    <Button
                      variant="contained"
                      startIcon={<TableChart />}
                      onClick={() => generateReport('excel')}
                      disabled={loading}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                      }}
                    >
                      Excel
                    </Button>
                  </Tooltip>
                  <Tooltip title="Gerar documento PDF">
                    <Button
                      variant="contained"
                      startIcon={<PictureAsPdf />}
                      onClick={() => generateReport('pdf')}
                      disabled={loading}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        },
                      }}
                    >
                      PDF
                    </Button>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Lista de Relatórios Gerados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="600">
                Relatórios Gerados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reports.length} {reports.length === 1 ? 'relatório disponível' : 'relatórios disponíveis'}
              </Typography>
            </Box>
            <Tooltip title="Atualizar lista">
              <IconButton
                onClick={loadReports}
                sx={{
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {reports.length === 0 ? (
            <EmptyState
              icon={InsertDriveFile}
              title="Nenhum relatório gerado"
              message="Gere seu primeiro relatório selecionando o período e formato acima"
            />
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence mode="popLayout">
                {reports.map((report) => (
                  <Grid item xs={12} sm={6} md={4} key={report.fileName}>
                    <ModernReportCard
                      report={report}
                      onDownload={downloadReport}
                      onDelete={deleteReport}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}
        </motion.div>

        {/* Informações sobre Relatórios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box mt={4}>
            <Typography variant="h5" fontWeight="600" mb={3}>
              Sobre os Relatórios
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)',
                    border: '1px solid',
                    borderColor: 'success.main',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <TableChart sx={{ fontSize: 40, color: '#10b981' }} />
                    <Typography variant="h6" fontWeight="600">
                      Relatório Excel
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                      Planilha completa com todas as transações
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                      Dados organizados por data
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                      Totalizadores automáticos
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Ideal para análises detalhadas
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)',
                    border: '1px solid',
                    borderColor: 'error.main',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <PictureAsPdf sx={{ fontSize: 40, color: '#ef4444' }} />
                    <Typography variant="h6" fontWeight="600">
                      Relatório PDF
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                      Relatório visual formatado
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                      Resumo financeiro do período
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                      Gráficos e estatísticas
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Ideal para apresentações
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default Reports;
