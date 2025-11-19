import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface QueryParams {
  month?: string;
  year?: string;
}

class ReportController {
  async generateMonthlyExcel(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query as QueryParams;

      if (!month || !year) {
        res.status(400).json({ error: 'Mês e ano são obrigatórios' });
        return;
      }

      const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
      const endDate = moment(startDate).endOf('month').toDate();

      // Buscar transações do período
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          date: { gte: startDate, lte: endDate }
        },
        include: {
          category: {
            select: {
              name: true,
              color: true
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      // Criar planilha
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Relatorio ${month}-${year}`);

      // Configurar cabeçalhos
      worksheet.columns = [
        { header: 'Data', key: 'date', width: 12 },
        { header: 'Descrição', key: 'description', width: 30 },
        { header: 'Categoria', key: 'category', width: 20 },
        { header: 'Tipo', key: 'type', width: 10 },
        { header: 'Valor', key: 'amount', width: 15 }
      ];

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2196F3' }
      };

      // Adicionar dados
      transactions.forEach(transaction => {
        worksheet.addRow({
          date: moment(transaction.date).format('DD/MM/YYYY'),
          description: transaction.description,
          category: transaction.category.name,
          type: transaction.type === 'income' ? 'Receita' : 'Despesa',
          amount: transaction.amount
        });
      });

      // Calcular totais
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpense;

      // Adicionar linha de totais
      worksheet.addRow({});
      worksheet.addRow({
        date: '',
        description: 'TOTAL RECEITAS',
        category: '',
        type: '',
        amount: totalIncome
      });
      worksheet.addRow({
        date: '',
        description: 'TOTAL DESPESAS',
        category: '',
        type: '',
        amount: totalExpense
      });
      worksheet.addRow({
        date: '',
        description: 'SALDO',
        category: '',
        type: '',
        amount: balance
      });

      // Estilizar totais
      const lastRow = worksheet.lastRow?.number || worksheet.rowCount;
      for (let i = lastRow - 2; i <= lastRow; i++) {
        worksheet.getRow(i).font = { bold: true };
        if (i === lastRow) {
          worksheet.getRow(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: balance >= 0 ? 'FF4CAF50' : 'FFF44336' }
          };
        }
      }

      // Formatação de valores
      worksheet.getColumn('amount').numFmt = 'R$ #,##0.00';

      // Salvar arquivo com userId para isolar por usuário
      const fileName = `relatorio-${req.userId}-${month}-${year}.xlsx`;
      const filePath = path.join(__dirname, '../../reports', fileName);

      // Criar diretório se não existir
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      await workbook.xlsx.writeFile(filePath);

      res.json({
        message: 'Relatório Excel gerado com sucesso',
        fileName,
        downloadUrl: `/api/reports/download/${fileName}`,
        summary: {
          totalTransactions: transactions.length,
          totalIncome,
          totalExpense,
          balance
        }
      });

    } catch (error) {
      console.error('Erro ao gerar relatório Excel:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async generateMonthlyPDF(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query as QueryParams;

      if (!month || !year) {
        res.status(400).json({ error: 'Mês e ano são obrigatórios' });
        return;
      }

      const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();
      const endDate = moment(startDate).endOf('month').toDate();

      // Buscar transações do período
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          date: { gte: startDate, lte: endDate }
        },
        include: {
          category: {
            select: {
              name: true,
              color: true
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { name: true, email: true }
      });

      // Criar PDF com userId para isolar por usuário
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `relatorio-${req.userId}-${month}-${year}.pdf`;
      const filePath = path.join(__dirname, '../../reports', fileName);

      // Criar diretório se não existir
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Cabeçalho
      doc.fontSize(20).text('Relatório Financeiro Mensal', { align: 'center' });
      doc.fontSize(14).text(`${moment(startDate).format('MMMM YYYY')}`, { align: 'center' });
      doc.moveDown();

      // Informações do usuário
      doc.fontSize(12).text(`Usuário: ${user?.name}`, 50, doc.y);
      doc.text(`Email: ${user?.email}`, 50, doc.y);
      doc.text(`Gerado em: ${moment().format('DD/MM/YYYY HH:mm')}`, 50, doc.y);
      doc.moveDown();

      // Calcular totais
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpense;

      // Resumo
      doc.fontSize(16).text('Resumo do Período', { underline: true });
      doc.fontSize(12);
      doc.text(`Total de Receitas: R$ ${totalIncome.toFixed(2).replace('.', ',')}`, 50, doc.y + 10);
      doc.text(`Total de Despesas: R$ ${totalExpense.toFixed(2).replace('.', ',')}`, 50, doc.y);
      doc.text(`Saldo: R$ ${balance.toFixed(2).replace('.', ',')}`, 50, doc.y, {
        color: balance >= 0 ? 'green' : 'red'
      } as any);
      doc.moveDown();

      // Transações por categoria (Receitas)
      const incomeCategories = transactions
        .filter(t => t.type === 'income')
        .reduce((acc: Record<string, number>, t) => {
          const catName = t.category.name;
          acc[catName] = (acc[catName] || 0) + t.amount;
          return acc;
        }, {});

      if (Object.keys(incomeCategories).length > 0) {
        doc.fontSize(14).text('Receitas por Categoria', { underline: true });
        doc.fontSize(10);
        Object.entries(incomeCategories).forEach(([category, amount]) => {
          doc.text(`${category}: R$ ${amount.toFixed(2).replace('.', ',')}`, 70, doc.y);
        });
        doc.moveDown();
      }

      // Transações por categoria (Despesas)
      const expenseCategories = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc: Record<string, number>, t) => {
          const catName = t.category.name;
          acc[catName] = (acc[catName] || 0) + t.amount;
          return acc;
        }, {});

      if (Object.keys(expenseCategories).length > 0) {
        doc.fontSize(14).text('Despesas por Categoria', { underline: true });
        doc.fontSize(10);
        Object.entries(expenseCategories).forEach(([category, amount]) => {
          doc.text(`${category}: R$ ${amount.toFixed(2).replace('.', ',')}`, 70, doc.y);
        });
        doc.moveDown();
      }

      // Lista de transações
      if (transactions.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Detalhes das Transações', { underline: true });
        doc.moveDown();

        transactions.forEach((transaction, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          doc.fontSize(10);
          const dateStr = moment(transaction.date).format('DD/MM/YYYY');
          const typeStr = transaction.type === 'income' ? 'Receita' : 'Despesa';
          const amountStr = `R$ ${transaction.amount.toFixed(2).replace('.', ',')}`;

          doc.text(`${index + 1}. ${dateStr} - ${transaction.description}`, 50, doc.y);
          doc.text(`   Categoria: ${transaction.category.name} | Tipo: ${typeStr} | Valor: ${amountStr}`, 50, doc.y);
          doc.moveDown(0.5);
        });
      }

      doc.end();

      // Aguardar conclusão do arquivo
      await new Promise<void>((resolve) => {
        stream.on('finish', () => resolve());
      });

      res.json({
        message: 'Relatório PDF gerado com sucesso',
        fileName,
        downloadUrl: `/api/reports/download/${fileName}`,
        summary: {
          totalTransactions: transactions.length,
          totalIncome,
          totalExpense,
          balance
        }
      });

    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listReports(req: Request, res: Response): Promise<void> {
    try {
      const reportsDir = path.join(__dirname, '../../reports');

      if (!fs.existsSync(reportsDir)) {
        res.json({ reports: [] });
        return;
      }

      const files = fs.readdirSync(reportsDir);

      // Filtrar apenas relatórios do usuário atual
      const userFiles = files.filter(file => file.includes(req.userId!));

      const reports = userFiles.map(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);

        // Remover userId do nome exibido
        const displayName = file.replace(`-${req.userId}`, '');

        return {
          fileName: file,
          displayName: displayName,
          downloadUrl: `/api/reports/download/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          type: path.extname(file).substring(1).toUpperCase()
        };
      });

      reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ reports });

    } catch (error) {
      console.error('Erro ao listar relatórios:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      const filePath = path.join(__dirname, '../../reports', fileName);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Arquivo não encontrado' });
        return;
      }

      // Verificar se o arquivo pertence ao usuário logado
      if (!fileName.includes(req.userId!)) {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      fs.unlinkSync(filePath);

      res.json({ message: 'Relatório excluído com sucesso' });

    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async downloadReport(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      const filePath = path.join(__dirname, '../../reports', fileName);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Arquivo não encontrado' });
        return;
      }

      // Verificar se o arquivo pertence ao usuário logado
      if (!fileName.includes(req.userId!)) {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      // Remover userId do nome do download
      const downloadName = fileName.replace(`-${req.userId}`, '');

      res.download(filePath, downloadName, (err) => {
        if (err) {
          console.error('Erro ao fazer download do arquivo:', err);
          res.status(500).json({ error: 'Erro ao fazer download do arquivo' });
        }
      });

    } catch (error) {
      console.error('Erro ao fazer download do relatório:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

const reportController = new ReportController();
export default reportController;
