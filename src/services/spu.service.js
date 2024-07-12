"use strict";
const _ = require("lodash");

const { NotFoundError } = require("../core/error.response");
const { findShopById } = require("../models/repositories/shop.repo");
const spuModel = require("../models/spu.model");
const { randomProductId } = require("../utils");
const { newSku, allSkuByProductId } = require("./sku.service");

const newSpu = async ({
  product_id,
  product_name,
  product_thumb,
  product_description,
  product_slug,
  product_price,
  product_category,
  product_shop,
  product_attributes,
  product_quantity,
  product_variations,
  sku_list = [],
}) => {
  try {
    // 1. check if shop exists or active

    const foundShop = await findShopById({ shop_id: product_shop });
    if (!foundShop) throw new NotFoundError("shop not found");

    // 2. create spu

    const spu = await spuModel.create({
      product_id: randomProductId(),
      product_name,
      product_thumb,
      product_description,
      product_slug,
      product_price,
      product_category,
      product_shop,
      product_attributes,
      product_quantity,
      product_variations,
    });
    if (spu && sku_list.length) {
      // create sku
      newSku({ sku_list, spu_id: spu.product_id }).then();
    }
    // 4. dong bo data via elasticsearch (search.service)
    // 5. return result object
    return !!spu;
    // 3. create inventory
  } catch (error) {}
};
const oneSpu = async ({ spu_id }) => {
  console.log("spu_id::", spu_id);
  try {
    const spu = await spuModel
      .findOne({
        product_id: spu_id,
        isPublished: true,
      })
      .lean();
    if (!spu) throw new NotFoundError("spu not found");
    const skus = await allSkuByProductId({ product_id: spu.product_id });
    console.log("sku_list", skus);
    return {
      spu_info: _.omit(spu, ["__v", "updatedAt"]),
      sku_list: skus.map((sku) =>
        _.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"])
      ),
    };
  } catch (error) {
    console.log("error query::", error);
    return null;
  }
};
module.exports = {
  newSpu,
  oneSpu,
};
