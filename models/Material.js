const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      index: true
    },
    code: {
      type: String,
      required: [true, 'Material code / SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    minimumStock: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock cannot be negative'],
      default: 0
    },
    location: {
      type: String,
      trim: true,
      default: '',
      index: true
    },
    supplierName: {
      type: String,
      trim: true,
      default: ''
    },
    supplierContact: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtual for stock status
materialSchema.virtual('stockStatus').get(function () {
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity <= this.minimumStock) return 'low_stock';
  return 'available';
});

materialSchema.set('toJSON', { virtuals: true });
materialSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Material', materialSchema);
