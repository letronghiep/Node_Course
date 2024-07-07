"use strict";
const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service");
class NotificationController {
    listNotifyByUser = async (req, res) => {
    new SuccessResponse({
      message: "listNotifyByUser",
      metadata: await NotificationService.listNotifyByUser(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
