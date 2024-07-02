"use strict";
const CheckoutService = require("../services/checkout.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class CheckoutController {
  checkoutReview = async (req, res) => {
    new CREATED({
      message: "Checkout success",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  };
  orderByUser = async (req, res) => {
    new CREATED({
      message: "Order success",
      metadata: await CheckoutService.orderByUser(req.body),
    }).send(res);
  };
  getOrderByUser = async (req, res) => {
    new SuccessResponse({
      message: "List order success",
      metadata: await CheckoutService.getOrderByUser(req.body),
    }).send(res);
  };
  getOrderDetailByUser = async (req, res) => {
    new SuccessResponse({
      message: "Order details",
      metadata: await CheckoutService.getOrderDetailByUser({
        order_id: req.params.order_id,
        ...req.body,
      }),
    }).send(res);
  };
  cancelOrder = async (req, res) => {
    new SuccessResponse({
      message: "Cancel success",
      metadata: await CheckoutService.cancelOrder({
        order_id: req.params.order_id,
        ...req.body,
      }),
    }).send(res);
  };
  updateOrder = async (req, res) => {
    new SuccessResponse({
      message: "update success",
      metadata: await CheckoutService.updateOrder({
        order_id: req.params.order_id,
        ...req.body,
      }),
    }).send(res);
  };
}
module.exports = new CheckoutController();
