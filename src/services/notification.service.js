"use strict";

const notificationModel = require("../models/notification.model");

// using function
const pushNotifyToSystem = async ({
  type = "SHOP-001",
  receiverId = 1,
  senderId = 1,
  options = {},
}) => {
  let notify_content;
  if (type === "SHOP-001") {
    notify_content = `@@@ vừa thêm một sản phẩm mới @@@@`;
  } else if (type === "PROMOTION-001") {
    notify_content = `@@@ vừa thêm một voucher mới @@@@`;
  }
  const newNotify = await notificationModel.create({
    notify_type: type,
    notify_content,
    notify_receiverId: receiverId,
    notify_senderId: senderId,
    notify_options: options,
  });
  return newNotify;
};
const listNotifyByUser = async ({ userId = 1, type = "ALL", isRead = 0 }) => {
  const match = { notify_receiverId: userId };
  if (type !== "ALL") match["notify_type"] = type;
  return await notificationModel.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        notify_type: 1,
        notify_senderId: 1,
        notify_receiverId: 1,
        notify_content: 1,
        /* notify_content: {
          $concat: [
            {
              $substr: ["$notify_options.shop_name", 0, -1],
            },
            " đã thêm một sản phẩm mới: ",
            {
              $substr: ["$notify_options.product_name", 0, -1],
            },
          ],
        }, */

        createdAt: 1,
        notify_options: 1,
      },
    },
  ]);
};
module.exports = {
  pushNotifyToSystem,
  listNotifyByUser,
};
