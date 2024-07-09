"use strict";
const crypto = require("node:crypto");
const cloudinary = require("../configs/cloudinary.config");
const urlImagePublic = "https://d3f2292ukg7uoi.cloudfront.net";
const {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteBucketCommand,
} = require("../configs/s3.config");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// upload file use s3Client
const uploadImageFromLocalS3 = async ({ file }) => {
  try {
    const randomImageName = () => crypto.randomBytes(16).toString("hex");
    const imageName = randomImageName();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
      Body: file.buffer,
      ContentType: "image/jpeg",
    });
    const result = await s3.send(command);
    console.log("result: ", result);
    const signedUrl = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageName,
    });
    const url = await getSignedUrl(s3, signedUrl, { expiresIn: 3600 });
    console.log(`url: ${url}`);
    return {
      url: `${urlImagePublic}/${imageName}`,
      result,
    };
  } catch (error) {
    console.log(`Error uploading...`, error);
  }
};
// end s3 service

// start upload use cloudinary
// upload from url image
const uploadImageFromUrl = async () => {
  try {
    const urlImage =
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvwyydm1w9nfa7";
    const folderName = "product/8409",
      newFileName = "test-demo";
    const result = await cloudinary.uploader.upload(urlImage, {
      public_id: newFileName,
      folder: folderName,
    });
    console.log("Image uploaded successfully", result);
    return result;
  } catch (error) {
    console.log("Error upload", error);
  }
};
// 2. upload from local
const uploadImageFromLocal = async ({ path, folderName = "product/8409" }) => {
  try {
    const result = await cloudinary.uploader.upload(path, {
      public_id: "thumb",
      folder: folderName,
    });
    console.log(result);
    return {
      image_url: result.secure_url,
      shopId: 8409,
      thumb_url: await cloudinary.url(result.public_id, {
        height: 100,
        width: 100,
        format: "jpg",
      }),
    };
  } catch (error) {
    console.log(`Error uploading...`, error);
  }
};
// 3. upload multiple files
const uploadImageFromLocalFiles = async ({
  files,
  folderName = "product/8409",
}) => {
  try {
    console.log("files::", files, folderName);
    if (!files.length) {
      return;
    }
    const uploadedUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folderName,
      });
      uploadedUrls.push({
        image_url: result.secure_url,
        shopId: 8409,
        thumb_url: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          format: "jpg",
        }),
      });
    }
    return uploadedUrls;
  } catch (error) {
    console.error("Error uploading images::", error);
  }
};
module.exports = {
  uploadImageFromUrl,
  uploadImageFromLocal,
  uploadImageFromLocalS3,
  uploadImageFromLocalFiles,
};
