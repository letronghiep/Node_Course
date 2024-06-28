"use strict";
const ProductService = require("../services/product.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res) => {
    new CREATED({
      message: "Product created",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  publishedProductInDraft = async (req, res) => {
    new SuccessResponse({
      message: "Product published",
      metadata: await ProductService.publishedAProductInDraft({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };
  unPublishedProductInDraft = async (req, res) => {
    new SuccessResponse({
      message: "Product published",
      metadata: await ProductService.unPublishedAProductInDraft({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };
  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Product updated successfully",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
    console.log("Product updated successfully1::", req.body);
  };
  // query
  getAllDraftProductForShop = async (req, res) => {
    new SuccessResponse({
      message: "Product draft",
      metadata: await ProductService.getAllDraftProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  getAllPublishedProductForShop = async (req, res) => {
    new SuccessResponse({
      message: "Product published",
      metadata: await ProductService.getAllPublishedProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  searchProductByUser = async (req, res) => {
    new SuccessResponse({
      message: "Product search list",
      metadata: await ProductService.searchProductByUser(req.params),
    }).send(res);
  };
  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "List search products",
      metadata: await ProductService.findAllProduct(req.query),
    }).send(res);
  };
  // find a Product
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Product Details",
      metadata: await ProductService.findProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  };
}
module.exports = new ProductController();
