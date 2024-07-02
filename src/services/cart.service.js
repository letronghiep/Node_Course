"use strict";
const cart = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
const { NotFoundError } = require("../core/error.response");
class CartService {
  // START REPO CART
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }
  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,

        "cart_products.productId": productId,
        cart_state: "active",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }
  // END REPO CART
  static async addToCart({ userId, product = {} }) {
    // check cart ton tai hay khong
    const userCart = await cart.findOne({
      cart_userId: userId,
    });
    if (!userCart) {
      // create cart
      return await CartService.createUserCart({ userId, product });
    }
    // neu co gio hang nhung chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }
    // gio hang ton tai va co san pham thi update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }
  // update cart
  /* 
    shop_order_ids: [
        {
        shopId,
        item_products: [
        {
            quantity, 
            shopId,
            old_quantity,
            product_id
        }
            
        ],
    }
    ]
  */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product
    console.log({ productId, quantity, old_quantity });
    const foundProduct = await getProductById(productId);
    console.log(foundProduct);
    if (!foundProduct) {
      throw new NotFoundError("Product does not exists");
    }
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError("Product does not exists");
    }
    if (quantity === 0) {
      await this.deleteUserCart({ userId, productId });
    }
    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }
  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: {
          cart_products: { productId },
        },
      };
    const deleteCart = await cart.updateOne(query, updateSet);
    return deleteCart;
  }
  static async getListUserCart({ userId }) {
    return await cart
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}
module.exports = CartService;
