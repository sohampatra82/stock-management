const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
      index: true
    },
    materialName: {
      type: String,
      required: true
    },
    materialCode: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['STOCK_IN', 'STOCK_OUT'],
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    supplier: {
      type: String,
      trim: true,
      default: ''
    },
    issuedTo: {
      type: String,
      trim: true,
      default: ''
    },
    purpose: {
      type: String,
      trim: true,
      default: ''
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: ''
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
      default: null
    },
    performedByName: {
      type: String,
      default: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for date-based queries
stockTransactionSchema.index({ createdAt: -1 });
stockTransactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
