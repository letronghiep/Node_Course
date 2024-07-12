"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const { grantAccess } = require("../../middlewares/rbac");
const { profiles, profile } = require("../../controllers/profile.controller");
const router = express.Router();

// router.use(authenticationV2);
// admin
router.get("/viewAny", grantAccess("readAny", "profile"), profiles);

// shop
router.get("/viewOwn", grantAccess("readOwn", "profile"), profile);
module.exports = router;
