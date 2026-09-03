const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  const d = new Date(date);
  if (format === 'full') {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStockStatusBadge = (quantity, minimumStock) => {
  if (quantity <= 0) {
    return { class: 'bg-danger', text: 'Out of Stock' };
  }
  if (quantity <= minimumStock) {
    return { class: 'bg-warning text-dark', text: 'Low Stock' };
  }
  return { class: 'bg-success', text: 'Available' };
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const parseQuantity = (value) => {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) return null;
  return num;
};

const getDateRange = (filter) => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'thismonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      return null;
  }
  return { start, end };
};

module.exports = {
  isValidObjectId,
  formatDate,
  getStockStatusBadge,
  sanitizeString,
  parseQuantity,
  getDateRange
};
