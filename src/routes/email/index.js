"use strict";
const express = require("express");
const T = require("../../controllers/checkout.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const { newTemplate } = require("../../controllers/email.controller");
const router = express.Router();
// router.use(authenticationV2);
router.post("/new_template", asyncHandler(newTemplate));

module.exports = router;
