const inventoryModel = require("../../models/inventories.model");
const { convertToObjMongo } = require("../../utils");
const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unKnow",
}) => {
  return await inventoryModel.create({
    inven_productId: productId,
    inven_stock: stock,
    inven_location: location,
    inven_shopId: shopId,
  });
};
const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_productId: convertToObjMongo(productId),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inven_stock: -quantity,
      },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createdAt: new Date(),
        },
      },
    },
    options = {
      upsert: true,
      new: true,
    };
  return await inventoryModel.updateOne(query, updateSet);
};
module.exports = {
  insertInventory,
  reservationInventory,
};
