"use strict";
const express = require("express");
const CheckoutController = require("../../controllers/checkout.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();
router.use(authenticationV2);
router.post("", asyncHandler(CheckoutController.orderByUser));
router.post("/review", asyncHandler(CheckoutController.checkoutReview));
router.get("", asyncHandler(CheckoutController.getOrderByUser));
router.get("/:order_id", asyncHandler(CheckoutController.getOrderDetailByUser));
router.patch("/cancel/:order_id", asyncHandler(CheckoutController.cancelOrder));
router.patch("/update/:order_id", asyncHandler(CheckoutController.updateOrder));

module.exports = router;
