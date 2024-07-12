"use strict";

const {
  createResource,
  createRole,
  roleList,
  resourceList,
} = require("../services/rbac.service");
const { SuccessResponse } = require("../core/success.response");
/**
 * @desc Create new role
 * @param {string} name
 * @param {*} res
 * @param {*} next
 */
const newRole = async (req, res, next) => {
  new SuccessResponse({
    message: "Created role",
    metadata: await createRole(req.body),
  }).send(res);
};
const newResource = async (req, res, next) => {
  new SuccessResponse({
    message: "Created resource",
    metadata: await createResource(req.body),
  }).send(res);
};
const listRole = async (req, res, next) => {
  new SuccessResponse({
    message: "list role",
    metadata: await roleList(req.query),
  }).send(res);
};
const listResource = async (req, res, next) => {
  new SuccessResponse({
    message: "List resource",
    metadata: await resourceList(req.query),
  }).send(res);
};
module.exports = {
  newResource,
  newRole,
  listResource,
  listRole,
};
