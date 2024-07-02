'use strict'

const { convertToObjMongo } = require("../../utils")
const cartModel = require("../cart.model")

const findCartById= async (cartId) => {
    return await cartModel.findOne({
        _id: convertToObjMongo(cartId),
        cart_state: 'active'
    }).lean()
}
module.exports = {
    findCartById
}