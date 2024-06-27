"use strict";
const JWT = require("jsonwebtoken");
const KeyTokenService = require("../services/keyToken.service");
const {
  NotFoundError,
  BadRequestError,
  AuthFailureError,
} = require("../core/error.response");
const { asyncHandler } = require("../helpers/asyncHandler");
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rToken-id",
};
const createTokensPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });
    //   Verify
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`Verify error::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * - Check userId missing??
   * get accessToken
   * verifyToken
   * check user in db
   * check keyStore with userId
   * Ok all => return next()
   *  */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");
  const keyStore = await KeyTokenService.findUserById(userId);
  if (!keyStore) throw new NotFoundError("Key store is not found");
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid User id");

    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw error;
  }
});
const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};
module.exports = {
  createTokensPair,
  authentication,
  verifyJWT,
};
