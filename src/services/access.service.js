"use strict";
const Shop = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const { createTokensPair, verifyJWT } = require("../auth/authUtils");
const KeyTokenService = require("./keyToken.service");
const { getInfoData } = require("../utils/lodash");
const {
  BadRequestError,
  ConflictRequestError,
  ForbiddenError,
  AuthFailureError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  // static handleRefreshToken = async (refreshToken) => {
  //   // check token da duoc su dung chua
  //   const foundToken = await KeyTokenService.findByRefreshTokenUsed(
  //     refreshToken
  //   );
  //   // console.log("User1::", { userId, email });
  //   console.log("User1::", foundToken);
  //   if (foundToken) {
  //     const { userId, email } = await verifyJWT(
  //       refreshToken,
  //       foundToken.privateKey
  //     );
  //     // xoa tat ca token trong keyStore
  //     await KeyTokenService.deleteKeyById(userId);
  //     throw new ForbiddenError("Something went wrong. Pls re-login");
  //   }
  //   // refreshToken don't use
  //   const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
  //   if (!holderToken) throw new AuthFailureError("Shop not found");
  //   // verify token
  //   const { userId, email } = await verifyJWT(
  //     refreshToken,
  //     holderToken.privateKey
  //   );
  //   const tokens = await createTokensPair(
  //     { userId, email },
  //     holderToken.publicKey,
  //     holderToken.privateKey
  //   );
  //   // update token
  //   await holderToken.updateOne({
  //     $set: {
  //       refreshToken: tokens.refreshToken,
  //     },
  //     $addToSet: {
  //       refreshTokenUsed: refreshToken,
  //     },
  //   });
  //   return {
  //     user: { userId, email },
  //     tokens,
  //   };
  // };
  static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError(
        "Something went wrong happend!! Pls login again"
      );
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError("Shop is not register");
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registered");
    // check Token is used ?
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );
    // Update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // refreshToken is used
      },
    });
    return {
      user,
      tokens,
    };
  };
  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeById(keyStore._id);
    console.log(delKey);
    return delKey;
  };
  /**
   * check email in dbs
   * match password
   * create accessToken and refreshToken
   * generateToken
   * get data and return login
   * **/
  static login = async ({ email, password, refreshToken = null }) => {
    // 1. Check email in dbs
    const foundUser = await findByEmail({ email });
    console.log(foundUser);
    if (!foundUser) throw new BadRequestError(`Could not find email`);
    // 2. Match password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) throw new BadRequestError(`Wrong password`);
    // 3. Create accessToken and refreshToken
    const publicKey = await crypto.randomBytes(64).toString("hex");
    const privateKey = await crypto.randomBytes(64).toString("hex");
    const { _id: userId } = foundUser;
    const tokens = await createTokensPair(
      { userId, email },
      publicKey,
      privateKey
    );
    // 4. GenerateToken
    const data = await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });
    // 5. Get data and return login
    return {
      code: 200,
      shop: getInfoData({
        field: ["_id", "name", "email"],
        object: foundUser,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await Shop.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequest("Error: Shop already registered!");
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await Shop.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });
      if (newShop) {
        // create private and public key
        /*     const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        }); */
        const publicKey = crypto.randomBytes(64).toString("hex");
        const privateKey = crypto.randomBytes(64).toString("hex");
        console.log({ privateKey, publicKey });
        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });
        if (!keyStore) {
          throw new BadRequest("Error create keyStore");
        }
        const tokens = await createTokensPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );
        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              field: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  };
}
module.exports = AccessService;
