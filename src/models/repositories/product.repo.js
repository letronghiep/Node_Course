"use strict";

const { Types } = require("mongoose");
const { product } = require("../product.model");
const { getUnSelectData, getSelectData } = require("../../utils");

const findAllDraftProducts = async ({ query, limit, skip }) => {
  return queryProducts({ query, limit, skip });
};

const findAllPublishedProducts = async ({ query, limit, skip }) => {
  return queryProducts({ query, limit, skip });
};

async function queryProducts({ query, limit, skip }) {
  return await product
    .find(query)
    .populate("product_shop", "email name -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}
async function publishedProductInDraft({ product_shop, product_id }) {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await product.findByIdAndUpdate(
    product_id,
    foundShop,
    { new: true }
  );
  return modifiedCount;
}
async function unPublishedProductInDraft({ product_shop, product_id }) {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  foundShop.isPublished = false;
  foundShop.isDraft = true;
  const { modifiedCount } = await product.findByIdAndUpdate(
    product_id,
    foundShop,
    { new: true }
  );
  return modifiedCount;
}
async function searchProductByUser({ keySearch }) {
  const textSearch = new RegExp(keySearch);
  console.log(textSearch);
  const result = await product
    .find(
      {
        isPublished: true,
        $text: { $search: textSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return result;
}
async function findAllProduct({ limit, sort, page, filter, select }) {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const skip = (page - 1) * limit;
  return await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
}
async function findProduct({ product_id, unSelect }) {
  return await product.findById(product_id).select(getUnSelectData(unSelect));
}
const removeUndefinedNullObject = (obj) => {
  const result = {};

  Object.keys(obj).forEach((k) => {
    const current = obj[k];

    if ([null, undefined].includes(current)) return;
    if (Array.isArray(current)) return;

    if (typeof current === "object") {
      result[k] = removeUndefinedNullObject(current);
      return;
    }

    result[k] = current;
  });

  return result;
};
const updateNestedObjectParser = (obj, parent, result = {}) => {
  Object.keys(obj).forEach(k => {
    const propName = parent ? `${parent}.${k}` : k
    if (typeof obj[k] == 'object' && !Array.isArray(obj[k])) {
      updateNestedObjectParser(obj[k], propName, result)
    }
    else {
      result[propName] = obj[k]
    }
  })
  return result
}
const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });
};
module.exports = {
  findAllDraftProducts,
  findAllPublishedProducts,
  publishedProductInDraft,
  unPublishedProductInDraft,
  searchProductByUser,
  findAllProduct,
  findProduct,
  removeUndefinedNullObject,
  updateNestedObjectParser,
  updateProductById
};
