import mongoose, { Schema } from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  model: string;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  rating: number;
  reviews: number;
  isActive: boolean;
  isFeatured: boolean;
  isDraft: boolean;
  draftSavedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: function(this: any) { return !this.isDraft || this.name; },
    trim: true
  },
  description: {
    type: String,
    required: function(this: any) { return !this.isDraft; },
  },
  price: {
    type: Number,
    required: function(this: any) { return !this.isDraft; },
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: function(this: any) { return !this.isDraft; },
  },
  brand: {
    type: String,
    required: function(this: any) { return !this.isDraft; },
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: function(this: any) { return !this.isDraft; },
    min: 0,
    default: 0
  },
  images: [{
    type: String,
    required: function(this: any) { return !this.isDraft; }
  }],
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  draftSavedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ brand: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ isDraft: 1 }); // Index for draft queries

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);