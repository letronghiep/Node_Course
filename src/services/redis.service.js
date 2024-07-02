"use strict";
const { promisify } = require("util");
const redis = require("redis");
const redisClient = redis.createClient();
const pexpire = promisify(redisClient.PEXPIRE).bind(redisClient);
const setnxAsync = promisify(redisClient.SETNX).bind(redisClient);
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const acquireLock = async (productId, quantity, cartId) => {
  await redisClient.connect();

  const key = `lock_v2024_${productId}`;
  console.log("key:P:", key);
  const retryTimes = 10;
  const expireTime = 3000; // 3s tam lock
  for (let i = 0; i < retryTimes; i++) {
    // tao 1 key, phan tu nao nam giu thi duoc vao thanh toan
    const result = await setnxAsync(key, expireTime);
    console.log("result::", result);
    if (result === 1) {
      // thao tac voi inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });
      if (isReservation.modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  await redisClient.disconnect()
};
const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return delAsyncKey;
};

module.exports = {
  acquireLock,
  releaseLock,
};
