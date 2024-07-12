"use strict";

const { newTemplate } = require("../services/templates.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class EmailController {
  newTemplate = async (req, res, next) => {
    new SuccessResponse({
      message: "new template",
      metadata: await newTemplate(req.body),
    }).send(res);
  };
}
module.exports = new EmailController();