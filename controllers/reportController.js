const Material = require('../models/Material');
const StockTransaction = require('../models/StockTransaction');
const { getDateRange, sanitizeString, isValidObjectId } = require('../utils/helpers');

const getReports = async (req, res) => {
  res.render('reports/index', {
    title: 'Reports',
    activeTab: 'overview'
  });
};

const getStockReport = async (req, res) => {
  try {
    const { status } = req.query;
    let materials = await Material.find().sort({ name: 1 });

    if (status === 'low') {
      materials = materials.filter((m) => m.quantity > 0 && m.quantity <= m.minimumStock);
    } else if (status === 'out') {
      materials = materials.filter((m) => m.quantity <= 0);
    } else if (status === 'available') {
      materials = materials.filter((m) => m.quantity > m.minimumStock);
    }

    if (req.query.export === 'csv') {
      return exportStockCSV(res, materials);
    }

    res.render('reports/stock', {
      title: 'Current Stock Report',
      materials,
      filters: { status: status || '' }
    });
  } catch (error) {
    console.error('Stock report error:', error);
    res.render('reports/stock', {
      title: 'Current Stock Report',
      materials: [],
      filters: {}
    });
  }
};

const getTransactionReport = async (req, res) => {
  try {
    const { type, period, startDate, endDate, material } = req.query;
    const query = {};

    if (type === 'STOCK_IN' || type === 'STOCK_OUT') {
      query.type = type;
    }

    if (material && isValidObjectId(material)) {
      query.materialId = material;
    }

    if (period && period !== 'custom') {
      const range = getDateRange(period);
      if (range) {
        query.createdAt = { $gte: range.start, $lte: range.end };
      }
    } else if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('performedBy', 'name');

    const materials = await Material.find().sort({ name: 1 }).select('name code');

    if (req.query.export === 'csv') {
      return exportTransactionsCSV(res, transactions);
    }

    res.render('reports/transactions', {
      title: 'Transaction Report',
      transactions,
      materials,
      filters: {
        type: type || '',
        period: period || '',
        startDate: startDate || '',
        endDate: endDate || '',
        material: material || ''
      }
    });
  } catch (error) {
    console.error('Transaction report error:', error);
    res.render('reports/transactions', {
      title: 'Transaction Report',
      transactions: [],
      materials: [],
      filters: {}
    });
  }
};

const exportStockCSV = (res, materials) => {
  const header = 'Material Name,Code,Category,Unit,Current Quantity,Minimum Stock,Status,Location,Supplier\n';
  const rows = materials
    .map((m) => {
      const status = m.quantity <= 0 ? 'Out of Stock' : m.quantity <= m.minimumStock ? 'Low Stock' : 'Available';
      return `"${m.name}","${m.code}","${m.category}","${m.unit}",${m.quantity},${m.minimumStock},"${status}","${m.location || ''}","${m.supplierName || ''}"`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=stock-report.csv');
  res.send(header + rows);
};

const exportTransactionsCSV = (res, transactions) => {
  const header = 'Date,Material,Code,Type,Quantity,Previous,New,Supplier/Issued To,Purpose,Remarks,Performed By\n';
  const rows = transactions
    .map((t) => {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      const party = t.type === 'STOCK_IN' ? t.supplier : t.issuedTo;
      const performer = t.performedByName || (t.performedBy && t.performedBy.name) || '';
      return `"${date}","${t.materialName}","${t.materialCode}","${t.type}",${t.quantity},${t.previousQuantity},${t.newQuantity},"${party || ''}","${t.purpose || ''}","${t.remarks || ''}","${performer}"`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transaction-report.csv');
  res.send(header + rows);
};

module.exports = {
  getReports,
  getStockReport,
  getTransactionReport
};
