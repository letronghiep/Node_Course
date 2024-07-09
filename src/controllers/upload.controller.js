"use strict";

const { BadRequestError } = require("../core/error.response");
const { SuccessResponse } = require("../core/success.response");
const {
  uploadImageFromUrl,
  uploadImageFromLocal,
  uploadImageFromLocalS3,
  uploadImageFromLocalFiles,
} = require("../services/upload.service");

class UploadController {
  uploadFile = async (req, res, next) => {
    new SuccessResponse({
      message: "upload success",
      metadata: await uploadImageFromUrl(),
    }).send(res);
  };
  uploadFileThumb = async (req, res, next) => {
    const { file } = req;
    if (!file) throw new BadRequestError("File missing uploaded");
    new SuccessResponse({
      message: "upload success",
      metadata: await uploadImageFromLocal({
        path: file.path,
      }),
    }).send(res);
  };
  uploadImageFromLocalFiles = async (req, res, next) => {
    const { files } = req;
    if (!files.length) throw new BadRequestError("files missing uploaded");
    new SuccessResponse({
      message: "upload files success ",
      metadata: await uploadImageFromLocalFiles({
        files,
      }),
    }).send(res);
  };

  // use s3 aws
  uploadFileFromLocalS3 = async (req, res, next) => {
    const { file } = req;
    if (!file) throw new BadRequestError("File missing uploaded");
    new SuccessResponse({
      message: "upload success use s3Client",
      metadata: await uploadImageFromLocalS3({
        file,
      }),
    }).send(res);
  };
}
module.exports = new UploadController();
