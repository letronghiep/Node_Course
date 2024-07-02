"use strict";
const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic } = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const {
  findAllDraftProducts,
  findAllPublishedProducts,
  publishedProductInDraft,
  unPublishedProductInDraft,
  searchProductByUser,
  findAllProduct,
  findProduct,
  updateNestedObjectParser,
  removeUndefinedNullObject,
  updateProductById,
} = require("../models/repositories/product.repo");
class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Electronics":
        return new Electronic(payload).createProduct();
      case "Clothings":
        return new Clothing(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product Types: ${type}`);
    }
  }
  static async updateProduct(type, productId, payload) {
    switch (type) {
      case "Electronics":
        return new Electronic(payload).updateProduct(productId);
      case "Clothings":
        return new Clothing(payload).updateProduct(productId);
      default:
        throw new BadRequestError(`Invalid product Types: ${type}`);
    }
  }
  static async publishedAProductInDraft({ product_shop, product_id }) {
    return await publishedProductInDraft({ product_shop, product_id });
  }
  static async unPublishedAProductInDraft({ product_shop, product_id }) {
    return await unPublishedProductInDraft({ product_shop, product_id });
  }
  // Query
  static async getAllDraftProducts({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftProducts({ query, limit, skip });
  }
  static async getAllPublishedProducts({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedProducts({ query, limit, skip });
  }
  static async searchProductByUser({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }
  static async findAllProduct({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProduct({
      limit,
      sort,
      page,
      filter,
      select: [
        "product_name",
        "product_price",
        "product_thumb",
        "product_shop",
      ],
    });
  }
  static async findProduct({ product_id }) {
    return findProduct({ product_id, unSelect: ["__v"] });
  }
  // End query
}
// define base product
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
    product_ratingAvg,
    product_variations,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_ratingAvg = product_ratingAvg;
    this.product_variations = product_variations;
  }
  //   create product
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });
    }
    return newProduct;
  }
  async updateProduct(productId, payload) {
    return await product.findByIdAndUpdate(productId, payload, {
      new: true,
    });
  }
}
// define sub class type Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError("Create new Clothing error");
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new Product error");
    return newProduct;
  }
  async updateProduct(productId) {
    const updateNest = updateNestedObjectParser(this);
    const objectParams = removeUndefinedNullObject(updateNest);
    if (objectParams.product_attributes) {
      updateProductById(productId, objectParams, clothing);
    }
    const updateProduct = await super.updateProduct(productId, objectParams);
    return updateProduct;
  }
}
class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("Create new Electronic error");
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new Product error");
    return newProduct;
  }
  async updateProduct(productId) {
    const updateNest = updateNestedObjectParser(this, product);
    const objectParams = removeUndefinedNullObject(updateNest);
    if (objectParams.product_attributes) {
      updateProductById(productId, objectParams, electronic);
    }
    const updateProduct = await super.updateProduct(productId, objectParams);
    return updateProduct;
  }
}
module.exports = ProductFactory;
