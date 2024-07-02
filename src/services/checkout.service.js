"use strict";

const { BadRequestError } = require("../core/error.response");
const { product } = require("../models/product.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const DiscountService = require("../services/discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const order = require("../models/order.model");
const {
  getOrderByUser,
  getOrderDetailByUser,
  cancelOrderByUser,
  updateOrder,
} = require("../models/repositories/checkout.repo");
// const productModel = require("../models/product.model");
const { convertToObjMongo } = require("../utils");
class CheckoutService {
  /* 
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discount: [],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    }
                ]
            },
            {
                shopId,
                shop_discount: [
                    {
                        shopId,
                        discountId,
                        codeId
                    }
                ],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    }
                ]
            }
        ]
    }

*/
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    const fountCart = await findCartById(cartId);
    if (!fountCart) {
      throw new BadRequestError("Cart does not exists");
    }
    const checkout_order = {
        totalPrice: 0, // tong tien hang
        feeShip: 0, // phi van chuyen
        totalDiscount: 0, // tong giam gia
        totalCheckout: 0, // tong thanh toan
      },
      shop_order_ids_new = [];
    // tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];
      // check product available
      const checkProductServer = await checkProductByServer(item_products);
      if (!checkProductServer[0]) throw new BadRequestError("order wrong!!!");
      // tong tien don hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      // tong tien truoc khi xu li
      checkout_order.totalPrice += checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };
      if (shop_discounts.length > 0) {
        // gia su chi co mot discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } =
          await DiscountService.getDiscountAmount({
            codeId: shop_discounts[0].codeId,
            userId,
            shopId,
            products: checkProductServer,
          });
        // tong cong discount giam gia
        checkout_order.totalDiscount += discount;
        // neu tien giam gia lon hon 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
        // tong thanh toan cuoi cung
        checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      }
      shop_order_ids_new.push(itemCheckout);
    }
    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
  // order
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address,
    user_payment,
  }) {
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });
    // check lai mot lan nua xem vuot ton kho hay khong
    // get new array Products
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log("[1]::", products);
    // const acquireProduct = [];
    // for (let i = 0; i < products.length; i++) {
    //   const { productId, quantity } = products[i];
    //   const keyLock = await acquireLock(productId, quantity, cartId);
    //   acquireProduct.push(keyLock ? true : false);
    //   if (keyLock) {
    //     await releaseLock(keyLock);
    //   }
    //   console.log('keyLock', keyLock)
    // }
    // // check neu co mot san pham het hang trong kho
    // if (acquireProduct.includes(false)) {
    //   throw new BadRequestError("Product out of stock");
    // }
    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });
    console.log("New order::", newOrder);
    // truong hop: neu insert thanh cong => remove products
    if (newOrder) {
      // remove product
      for (let i = 0; i < products.length; i++) {
        const result = await product.updateOne(
          {
            _id: convertToObjMongo(products[i].productId),
            product_quantity: { $gte: products[i].quantity },
          },
          { $inc: { product_quantity: -products[i].quantity } }
        );
        if (result.nModified === 0) {
          throw new Error(
            `Not enough stock for product ${item.productId.name}`
          );
        }
      }
    }
    return newOrder;
  }
  /* 
    1> Query Order [User]
  */
  static async getOrderByUser({ userId, limit = 10, skip = 0 }) {
    const query = {
      order_userId: userId,
    };
    return await getOrderByUser({ query, limit, skip });
  }
  /* 
    1> Query OrderDetail [User]
  */
  static async getOrderDetailByUser({ order_id, userId }) {
    console.log("order_id[1]::", order_id);
    return await getOrderDetailByUser({ order_id, userId});
  }
  /* 
    1> cancel Order [User]
  */
  static async cancelOrder({ order_id, userId }) {
    return await cancelOrderByUser({ order_id, userId });
  }
  /* 
    1> update Order [Shop | Admin]
  */
  static async updateOrder({ order_id, order_status }) {
    return await updateOrder({ order_id, order_status });
  }
}
module.exports = CheckoutService;
