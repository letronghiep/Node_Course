"use strict";
const multer = require("multer");

// upload memory
const uploadMemory = multer({
  storage: multer.memoryStorage(),
});
// disk
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./src/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});
module.exports = {
  uploadDisk,
  uploadMemory,
};
