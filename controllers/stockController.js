const Material = require('../models/Material');
const StockTransaction = require('../models/StockTransaction');
const { sendStockReductionEmail, sendLowStockEmail } = require('../services/emailService');
const { sanitizeString, parseQuantity } = require('../utils/helpers');

const getAddStock = async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 }).select('name code quantity unit');
    res.render('stock/add', {
      title: 'Stock In',
      materials,
      form: {},
      error: null,
      success: null
    });
  } catch (error) {
    console.error(error);
    res.render('stock/add', {
      title: 'Stock In',
      materials: [],
      form: {},
      error: 'Unable to load page.',
      success: null
    });
  }
};

const postAddStock = async (req, res) => {
  const materials = await Material.find().sort({ name: 1 }).select('name code quantity unit');
  const form = {
    materialCode: sanitizeString(req.body.materialCode || '').toUpperCase(),
    quantity: req.body.quantity,
    supplier: sanitizeString(req.body.supplier || ''),
    referenceNumber: sanitizeString(req.body.referenceNumber || ''),
    remarks: sanitizeString(req.body.remarks || '')
  };

  try {
    const quantity = parseQuantity(form.quantity);

    if (!form.materialCode) {
      return res.render('stock/add', {
        title: 'Stock In',
        materials,
        form,
        error: 'Please enter Material Code.',
        success: null
      });
    }

    if (quantity === null || quantity < 1) {
      return res.render('stock/add', {
        title: 'Stock In',
        materials,
        form,
        error: 'Please enter a valid quantity (minimum 1).',
        success: null
      });
    }

    const material = await Material.findOne({ code: form.materialCode });
    if (!material) {
      return res.render('stock/add', {
        title: 'Stock In',
        materials,
        form,
        error: 'Material not found with code "' + form.materialCode + '". Add the material first from Materials menu.',
        success: null
      });
    }

    const previousQuantity = material.quantity;
    const newQuantity = previousQuantity + quantity;

    material.quantity = newQuantity;
    await material.save();

    await StockTransaction.create({
      materialId: material._id,
      materialName: material.name,
      materialCode: material.code,
      type: 'STOCK_IN',
      quantity,
      previousQuantity,
      newQuantity,
      supplier: form.supplier || material.supplierName,
      referenceNumber: form.referenceNumber,
      remarks: form.remarks,
      performedBy: null,
      performedByName: req.session.adminName || 'Admin'
    });

    const refreshed = await Material.find().sort({ name: 1 }).select('name code quantity unit');
    return res.render('stock/add', {
      title: 'Stock In',
      materials: refreshed,
      form: {},
      error: null,
      success:
        'Stock added successfully. ' +
        material.name +
        ' (' +
        material.code +
        '): ' +
        previousQuantity +
        ' → ' +
        newQuantity +
        ' ' +
        material.unit
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.render('stock/add', {
      title: 'Stock In',
      materials,
      form,
      error: 'Unable to add stock. Please try again.',
      success: null
    });
  }
};

const getReduceStock = async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 }).select('name code quantity unit');
    res.render('stock/reduce', {
      title: 'Stock Out',
      materials,
      form: {},
      error: null,
      success: null
    });
  } catch (error) {
    console.error(error);
    res.render('stock/reduce', {
      title: 'Stock Out',
      materials: [],
      form: {},
      error: 'Unable to load page.',
      success: null
    });
  }
};

const postReduceStock = async (req, res) => {
  const materials = await Material.find().sort({ name: 1 }).select('name code quantity unit');
  const form = {
    materialCode: sanitizeString(req.body.materialCode || '').toUpperCase(),
    quantity: req.body.quantity,
    issuedTo: sanitizeString(req.body.issuedTo || ''),
    purpose: sanitizeString(req.body.purpose || ''),
    remarks: sanitizeString(req.body.remarks || '')
  };

  try {
    const quantity = parseQuantity(form.quantity);

    if (!form.materialCode) {
      return res.render('stock/reduce', {
        title: 'Stock Out',
        materials,
        form,
        error: 'Please enter Material Code.',
        success: null
      });
    }

    if (quantity === null || quantity < 1) {
      return res.render('stock/reduce', {
        title: 'Stock Out',
        materials,
        form,
        error: 'Please enter a valid quantity (minimum 1).',
        success: null
      });
    }

    const material = await Material.findOne({ code: form.materialCode });
    if (!material) {
      return res.render('stock/reduce', {
        title: 'Stock Out',
        materials,
        form,
        error: 'Material not found with code "' + form.materialCode + '". Check the code or add the material first.',
        success: null
      });
    }

    if (quantity > material.quantity) {
      return res.render('stock/reduce', {
        title: 'Stock Out',
        materials,
        form,
        error:
          'Insufficient stock. Only ' +
          material.quantity +
          ' ' +
          material.unit +
          ' available for ' +
          material.name +
          '.',
        success: null
      });
    }

    const previousQuantity = material.quantity;
    const newQuantity = previousQuantity - quantity;

    material.quantity = newQuantity;
    await material.save();

    await StockTransaction.create({
      materialId: material._id,
      materialName: material.name,
      materialCode: material.code,
      type: 'STOCK_OUT',
      quantity,
      previousQuantity,
      newQuantity,
      issuedTo: form.issuedTo,
      purpose: form.purpose,
      remarks: form.remarks,
      performedBy: null,
      performedByName: req.session.adminName || 'Admin'
    });

    // Optional email notifications
    try {
      await sendStockReductionEmail({
        materialName: material.name,
        materialCode: material.code,
        previousQuantity,
        quantity,
        newQuantity,
        minimumStock: material.minimumStock,
        issuedTo: form.issuedTo,
        purpose: form.purpose,
        date: new Date(),
        unit: material.unit
      });
      if (newQuantity <= material.minimumStock) {
        await sendLowStockEmail({
          materialName: material.name,
          materialCode: material.code,
          currentQuantity: newQuantity,
          minimumStock: material.minimumStock,
          unit: material.unit
        });
      }
    } catch (e) {
      console.error('Email error:', e.message);
    }

    const refreshed = await Material.find().sort({ name: 1 }).select('name code quantity unit');
    return res.render('stock/reduce', {
      title: 'Stock Out',
      materials: refreshed,
      form: {},
      error: null,
      success:
        'Stock reduced successfully. ' +
        material.name +
        ' (' +
        material.code +
        '): ' +
        previousQuantity +
        ' → ' +
        newQuantity +
        ' ' +
        material.unit
    });
  } catch (error) {
    console.error('Reduce stock error:', error);
    res.render('stock/reduce', {
      title: 'Stock Out',
      materials,
      form,
      error: 'Unable to reduce stock. Please try again.',
      success: null
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = {};
    if (type === 'STOCK_IN' || type === 'STOCK_OUT') query.type = type;
    if (search) {
      const s = sanitizeString(search);
      query.$or = [
        { materialName: { $regex: s, $options: 'i' } },
        { materialCode: { $regex: s, $options: 'i' } },
        { issuedTo: { $regex: s, $options: 'i' } },
        { supplier: { $regex: s, $options: 'i' } }
      ];
    }
    const transactions = await StockTransaction.find(query).sort({ createdAt: -1 }).limit(300);
    res.render('stock/history', {
      title: 'Transaction History',
      transactions,
      filters: { type: type || '', search: search || '' }
    });
  } catch (error) {
    console.error(error);
    res.render('stock/history', {
      title: 'Transaction History',
      transactions: [],
      filters: {}
    });
  }
};

module.exports = {
  getAddStock,
  postAddStock,
  getReduceStock,
  postReduceStock,
  getHistory
};
