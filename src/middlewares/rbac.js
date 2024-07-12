"use strict";
const { AuthFailureError } = require("../core/error.response");
const { roleList } = require("../services/rbac.service");
const rbac = require("./role.middleware");
const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      rbac.setGrants(
        await roleList({
          userId: 9999,
        })
      );
      const rol_name = req.query.role;

      const permission = rbac.can(rol_name)[action](resource);
      console.log("action::", action);
      console.log("resource::", resource);
      console.log("permission::", permission);
      if (!permission.granted) {
        throw new AuthFailureError("u dont have enough permission");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
module.exports = {
  grantAccess,
};
