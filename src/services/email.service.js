"use strict";
const { newOtp } = require("./otp.service");
const Template = require("../models/templates.model");
const { getTemplate } = require("./templates.service");
const transport = require("../configs/nodemailer.config");
const { NotFoundError } = require("../core/error.response");
const { replacePlaceholder } = require("../utils");
const otpModel = require("../models/otp.model");
const sendEmailLinkVerify = async ({
  html,
  toEmail,
  subject = "Xác nhận email đăng ký",
  text = "xác nhận...",
}) => {
  try {
    const mailOptions = {
      from: '"Shop" <letronghiep213@gmail.com>',
      to: toEmail,
      subject,
      text,
      html,
    };
    transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.log("err", err);
      }
      console.log(`Message sent::`, info.messageId);
    });
  } catch (error) {
    console.error(`error send Email::`, error);
    return error;
  }
};
const sendEmailToken = async ({ email = null }) => {
  try {
    // 1. get token
    console.log("Email", email);
    const token = await newOtp({ email });
    // 2. get templates
    const template = await getTemplate({
      tem_name: "HTML EMAIL TOKEN",
    });
    if (!template) throw new NotFoundError("Template not found");
    // 3. replace placeholder with params
    const content = replacePlaceholder(template.tem_html, {
      link_verify: `http://localhost:3055/v1/api/user/welcome?token=${token.otp_token}`,
    });
    // 3. send email
    sendEmailLinkVerify({
      html: content,
      toEmail: email,
      subject: "Vui lòng xác nhận địa chỉ email đăng ký shop",
    }).catch((error) => console.log(error));
    return 1;
  } catch (error) {
    console.log("Error in send::", error);
  }
};

module.exports = {
  sendEmailToken
};
