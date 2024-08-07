"use strict";
const express = require("express");
const ProductController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();
router.get("", asyncHandler(ProductController.findAllProducts));
router.get("/sku/select_variation", asyncHandler(ProductController.findOneSku));
router.get("/spu/get_spu_info", asyncHandler(ProductController.findOneSpu));
router.get("/:id", asyncHandler(ProductController.findProduct));
router.get(
  "/search/:keySearch",
  asyncHandler(ProductController.searchProductByUser)
);

router.use(authenticationV2);

router.post("", asyncHandler(ProductController.createProduct));
router.post("/spu/new", asyncHandler(ProductController.createSpu));
router.patch("/:productId", asyncHandler(ProductController.updateProduct));

router.post(
  "/published/:id",
  asyncHandler(ProductController.publishedProductInDraft)
);
router.post(
  "/unPublished/:id",
  asyncHandler(ProductController.unPublishedProductInDraft)
);
//get
router.get(
  "/drafts/all",
  asyncHandler(ProductController.getAllDraftProductForShop)
);
router.get(
  "/published/all",
  asyncHandler(ProductController.getAllPublishedProductForShop)
);

module.exports = router;
