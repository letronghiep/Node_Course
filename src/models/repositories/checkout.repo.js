"use strict";

const { convertToObjMongo } = require("../../utils");
const orderModel = require("../order.model");

const getOrderByUser = async ({ query, limit, skip }) => {
  return await orderModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const getOrderDetailByUser = async ({ order_id, userId}) => {
  console.log(`order_id`, order_id)
  return await orderModel
    .findOne({ _id: convertToObjMongo(order_id), order_userId: userId })  
    .lean()
    .exec();
};

const cancelOrderByUser = async ({ order_id, userId }) => {
  const foundOrder = await orderModel.findOne({
    _id: convertToObjMongo(order_id),
    order_userId: userId,
  });
  console.log
  if (!foundOrder) return null;
  foundOrder.order_status = "cancelled";
  const { modifiedCount } = await orderModel.findByIdAndUpdate(
    order_id,
    foundOrder,
    {
      new: true,
    }
  );
  return modifiedCount;
};
const updateOrder  = async ({order_id, order_status}) =>{
  const foundOrder = await orderModel.findOne({
    _id: convertToObjMongo(order_id),
  });
  if (!foundOrder) return null;
  foundOrder.order_status = order_status;
  const { modifiedCount } = await orderModel.findByIdAndUpdate(
    order_id,
    foundOrder,
    {
      new: true,
    }
  );
  return modifiedCount;
}
module.exports = {
  getOrderByUser,
  getOrderDetailByUser,
  cancelOrderByUser,
  updateOrder
};
