const Material = require('../models/Material');
const StockTransaction = require('../models/StockTransaction');

const getDashboard = async (req, res) => {
  try {
    const materials = await Material.find();
    const totalMaterials = materials.length;
    const totalStock = materials.reduce((sum, m) => sum + m.quantity, 0);
    const lowStockItems = materials.filter((m) => m.quantity > 0 && m.quantity <= m.minimumStock);
    const outOfStockItems = materials.filter((m) => m.quantity <= 0);

    const recentTransactions = await StockTransaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('performedBy', 'name');

    res.render('dashboard', {
      title: 'Dashboard',
      stats: {
        totalMaterials,
        totalStock,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      },
      lowStockItems,
      outOfStockItems,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', {
      title: 'Dashboard',
      stats: {
        totalMaterials: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      },
      lowStockItems: [],
      outOfStockItems: [],
      recentTransactions: []
    });
  }
};

module.exports = { getDashboard };
