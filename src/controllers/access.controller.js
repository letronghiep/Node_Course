"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Refresh successfully",
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    // v2
    new SuccessResponse({
      message: "Refresh successfully",
      metadata: await AccessService.handleRefreshTokenV2({
        keyStore: req.keyStore,
        user: req.user,
        refreshToken: req.refreshToken,
      }),
    }).send(res);
  };
  logout = async (req, res) => {
    new SuccessResponse({
      message: "Logout Success",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
  login = async (req, res) => {
    new SuccessResponse({
      message: "Login success",

      metadata: await AccessService.login(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Shop register success",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };
}
module.exports = new AccessController();
