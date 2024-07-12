"use strict";

const userModel = require("../user.model");
/**
 * @description: create a new user
 * @param {*} param0
 * @returns
 */
const createUser = async ({
  usr_id,
  usr_name,
  usr_slug,
  usr_password,
  usr_role,
}) => {
  const user = await userModel.create({
    usr_id,
    usr_name,
    usr_slug,
    usr_password,
    usr_role,
  });
  return user;
};
module.exports = {
  createUser,
};
