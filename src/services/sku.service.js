"use strict";

const skuModel = require("../models/sku.model");
const _ = require("lodash");
const { randomProductId } = require("../utils");

const newSku = async ({ spu_id, sku_list }) => {
  try {
    const convert_sku_list = sku_list.map((sku) => {
      return {
        ...sku,
        product_id: spu_id,
        sku_id: `${spu_id}.${randomProductId()}`,
      };
    });
    const skus = await skuModel.create(convert_sku_list);
    return skus;
  } catch (error) {
    console.log("Error in creating::", error);
    return [];
  }
};
const oneSku = async ({ sku_id, product_id }) => {
  try {
    // read cache
    const sku = await skuModel
      .findOne({
        sku_id,
        product_id,
      })
      .lean();
    if (sku) {
      // set cached
    }
    return _.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"]);
  } catch (error) {
    return null;
  }
};
const allSkuByProductId = async ({ product_id }) => {
  try {
    // 1. spu_id

    const skus = await skuModel
      .find({
        product_id,
      })
      .lean();
    return skus;
  } catch (error) {
    console.log("Error in fetching all skus::", error);
    return [];
  }
};
module.exports = {
  newSku,
  oneSku,
  allSkuByProductId
};
