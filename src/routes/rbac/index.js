"use strict";
const express = require("express");
const {
  listResource,
  listRole,
  newResource,
  newRole,
} = require("../../controllers/rbac.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// router.use(authenticationV2);
router.post("/role", asyncHandler(newRole));
router.get("/roles", asyncHandler(listRole));



router.post("/resource", asyncHandler(newResource));
router.get("/resources", asyncHandler(listResource));
module.exports = router;
