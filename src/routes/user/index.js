"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const { newUser, checkLoginEmailToken } = require("../../controllers/user.controller");
const router = express.Router();

// router.use(authenticationV2);
router.post('/new_user', asyncHandler(newUser))
router.get('/welcome', asyncHandler(checkLoginEmailToken))
module.exports = router;
