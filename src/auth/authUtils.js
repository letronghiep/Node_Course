"use strict";
const JWT = require("jsonwebtoken");
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
module.exports = {
  createTokensPair,
};
