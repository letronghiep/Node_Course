"use strict";
const User = require("../models/user.model");
const { SuccessResponse, CREATED } = require("../core/success.response");
const { sendEmailToken, checkEmailToken } = require("./email.service");
const otpModel = require("../models/otp.model");
const userModel = require("../models/user.model");
const { BadRequestError } = require("../core/error.response");
const { getInfoData } = require("../utils/lodash");
// crypto
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const KeyTokenService = require("./keyToken.service");
const { createTokensPair } = require("../auth/authUtils");
const { createUser } = require("../models/repositories/user.repo");

const newUser = async ({ email = null, captcha = null }) => {
  // 1. check email exist in db
  const user = await User.findOne({ email }).lean();
  // 2. if exists
  if (user) {
    return { message: "Email already exists." };
  }
  // 3. send token via email user
  const result = await sendEmailToken({
    email,
  });
  return {
    message: "verify email user",
    metadata: {
      token: result,
    },
  };
};
const checkLoginEmailToken = async ({ token }) => {
  try {
    // 1. check token in model otp
    const { otp_email: email, otp_token } = await checkEmailToken({ token });
    if (email) throw new NotFoundError("Email token not found");
    // check exists email in service
    const hasUser = await findUserByEmailWithLogin({ email });
    if (hasUser) throw new BadRequestError("Email has already");

    // new user
    const passwordHash = await bcrypt.hash(email, 10);
    const newUser = await createUser({
      usr_id: 1,
      usr_slug: "xyzabc",
      usr_name: email,
      usr_password: passwordHash,
      usr_role: "",
    });
    if (newUser) {
      const privateKey = await crypto.randomBytes(64).toString("hex");
      const publicKey = await crypto.randomBytes(64).toString("hex");
      // public key cryptography standards;
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newUser.usr_id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("key store error");
      }
      // 2. create token pair
      const tokens = await createTokensPair(
        {
          userId: newUser._id,
          email,
        },
        publicKey,
        privateKey
      );

      return new CREATED({
        message: "key token created",
        metadata: {
          user: getInfoData({
            field: ["usr_id", "usr_name", "usr_email"],
            object: newUser,
          }),
          tokens,
        },
      });
    }
  } catch (error) {}
};

const findUserByEmailWithLogin = async ({ email }) => {
  const user = await userModel
    .findOne({
      usr_email: email,
    })
    .lean();
  if (user) return user;
};

module.exports = {
  newUser,
  checkLoginEmailToken
};
