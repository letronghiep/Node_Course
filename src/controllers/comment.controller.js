"use strict";
const { createComment, getCommentByParentId, deleteComment } = require("../services/comment.service");
const { CREATED, SuccessResponse } = require("../core/success.response");
class CommentController {
  createComment = async (req, res) => {
    new CREATED({
      message: "Created new comment",
      metadata: await createComment(req.body),
    }).send(res);
  };
  getCommentByParentId = async (req, res) => {
    new SuccessResponse({
      message: "get list comment",
      metadata: await getCommentByParentId(req.query),
    }).send(res);
  };
  deleteComment = async (req, res) => {
    new SuccessResponse({
      message: "deleted comment",
      metadata: await deleteComment(req.body),
    }).send(res);
  };
}
module.exports = new CommentController()