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

// const authentication = asyncHandler(async (req, res, next) => {
//   /**
//    * - Check userId missing??
//    * get accessToken
//    * verifyToken
//    * check user in db
//    * check keyStore with userId
//    * Ok all => return next()
//    *  */
//   const userId = req.headers[HEADER.CLIENT_ID];
//   if (!userId) throw new AuthFailureError("Invalid Request");
//   const keyStore = await KeyTokenService.findUserById(userId);
//   if (!keyStore) throw new NotFoundError("Key store is not found");
//   const accessToken = req.headers[HEADER.AUTHORIZATION];
//   if (!accessToken) throw new AuthFailureError("Invalid Request");
//   try {
//     const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
//     if (userId !== decodeUser.userId)
//       throw new AuthFailureError("Invalid User id");

//     req.keyStore = keyStore;
//     req.user = decodeUser;
//     return next();
//   } catch (error) {
//     throw error;
//   }
// });
const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};
const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   * - Check userId missing??
   * get accessToken
   * verifyToken
   * check user in db
   * check keyStore with userId
   * Ok all => return next()
   *  */
  // 1.
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");
  // 2.
  const keyStore = await KeyTokenService.findUserById(userId);
  if (!keyStore) throw new NotFoundError("Not found key store");
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN];

      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      console.log("decode úe", decodeUser);
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid User id");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      console.log("req.user", req.keyStore);
      return next();
    } catch (error) {
      throw error;
    }
  }
  // 3.
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");
  try {
    const decodeUser =  JWT.verify(accessToken, keyStore.publicKey);
    console.log("decode úe", decodeUser);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid User id");
    req.keyStore = keyStore;
    req.user = decodeUser
    console.log("req.user", req.keyStore);
    return next();
  } catch (error) {
    throw error;
  }
});
module.exports = {
  createTokensPair,
  authenticationV2,
  verifyJWT,
};
