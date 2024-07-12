"use strict";
const crypto = require("crypto");
// model otp
const Otp = require("../models/otp.model");
const generateTokenRandom = () => {
  const token = crypto.randomInt(0, Math.pow(2, 32));
  return token;
};
const newOtp = async ({ email }) => {
  const token = generateTokenRandom();
  const newToken = await Otp.create({
    otp_token: token,
    otp_email: email,
  });
  console.log(`newToken`, newToken);
  return newToken;
};
const checkEmailToken = async ({ token }) => {
  // 1. check exists token
  const hasToken = await otpModel.findOne({
    otp_token: token,
  });
  if (!hasToken) throw new NotFoundError("token not found!");
  // delete token
  await otpModel
    .deleteOne({
      otp_token: token,
    })
    .then();
  return token;
};
module.exports = {
  newOtp,
  checkEmailToken,
};
