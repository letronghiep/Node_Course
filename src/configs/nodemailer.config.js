"use strict";
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 465,
  secure: true,
  auth: {
    user: "AKIATALXCWMTZV2XYUVI",
    pass: "BIedn7uc5cjVz6MIMB6ZfeR1+EM+uztWSfdkUs0gAydy",
  },
});
module.exports = transport;
