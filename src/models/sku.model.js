"use strict";
const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "SKU";
const COLLECTION_NAME = "skus";
const skuSchema = new Schema(
  {
    sku_id: {
      type: String,
      required: true,
      unique: true,
    },
    /* 
        color = [red, green] = [0, 1]
        size = [S, M, L] = [0, 1, 2]
        => red+S= [0,1]
        => green+M= [1,1]
    */
    sku_default: {
      type: Boolean,
      default: false,
    },
    sku_slug: {
      type: String,
      default: "",
    },
    sku_sort: {
      type: Number,
      default: 0,
    },
    sku_price: {
      type: String,
      required: true,
    },
    sku_stock: {
      type: Number,
      default: 0,
    },
    product_id: {
      type: String,
      required: true,
    }, // ref to spu product
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
module.exports = model(DOCUMENT_NAME, skuSchema);
