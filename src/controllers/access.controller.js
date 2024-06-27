"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res) => {
    new SuccessResponse({
      message: "Login success",

      metadata: await AccessService.login(req.body)
    }).send(res);
  }
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Shop register success",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };
}
module.exports = new AccessController();
