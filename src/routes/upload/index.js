"use strict";
const express = require("express");
const uploadController = require("../../controllers/upload.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const { uploadDisk, uploadMemory } = require("../../configs/multer.config");
const router = express.Router();

// router.use(authenticationV2);

router.post("/product", asyncHandler(uploadController.uploadFile));
router.post(
  "/product/thumb",
  uploadDisk.single("file"),
  asyncHandler(uploadController.uploadFileThumb)
);
router.post(
  "/product/multiple",
  uploadDisk.array("files", 5),
  asyncHandler(uploadController.uploadImageFromLocalFiles)
);
// s3 aws
router.post(
  "/product/bucket",
  uploadMemory.single("file"),
  asyncHandler(uploadController.uploadFileFromLocalS3)
);
module.exports = router;
