"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountUnSelect,
  checkDiscountExists,
  findAllDiscountSelect,
} = require("../models/repositories/discount.repo");
const { findAllProduct } = require("../models/repositories/product.repo");
const { convertToObjMongo } = require("../utils/index");
/* 
    Discount Service
    1 - generator discount code [Shop | Admin]
    2 - get discount amount [User]
    3 - get all discount code
    4 - verify discount code [user]
    5 - delete discount code [Admin | Shop]
    6 - cancel discount code [user]

*/
class DiscountService {
  static async createDiscountCode(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      start_date,
      end_date,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user,
      min_order_value,
      max_value,
      shopId,
      is_active,
      applies_to,
      product_ids,
    } = payload;
    // kiem tra
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date))
      throw new BadRequestError("Discount code has expired");
    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must be less than end date");
    }
    // create index for discount code
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjMongo(shopId),
    });
    if (foundDiscount) throw new BadRequestError("Discount exists");
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: start_date,
      discount_end_date: end_date,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value,
      discount_max_value: max_value,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: product_ids,
    });
    return newDiscount;
  }
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    console.log(code);
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shopId: convertToObjMongo(shopId),
    });
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exists");
    }
    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      products = await findAllProduct({
        filter: {
          product_shop: convertToObjMongo(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    if (discount_applies_to === "specific") {
      products = await findAllProduct({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjMongo(shopId),
        discount_is_active: true,
      },
      select: [
        "discount_code",
        "discount_name",
        "discount_value",
        "discount_max_value",
      ],
      model: discountModel,
    });
    return discounts;
  }
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjMongo(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError("discount doesn't exists");
    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;
    if (!discount_is_active) throw new NotFoundError("discount expired");
    if (!discount_max_uses) throw new NotFoundError("discount are out");
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    )
      throw new NotFoundError("discount expired");
    //  check gia tri toi da
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `discount requires a minium order value of ${discount_min_order_value}`
        );
      }
    }
    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUseDiscount) {
        throw new NotFoundError(
          `You have used ${discount_max_uses_per_user} times`
        );
      }
    }
    // check xem discount la fixamout hay percentage
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);
    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }
  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findByIdAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjMongo(shopId),
    });
    return deleted;
  }
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjMongo(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError("Discount not exists");
    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}
module.exports = DiscountService;
