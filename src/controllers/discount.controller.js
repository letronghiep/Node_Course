"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");
class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new CREATED({
      message: "Discount created",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: "Code found",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Discount Amount",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
  getAllDiscountCodesWithProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Discount with products",
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  };
}
module.exports = new DiscountController();
