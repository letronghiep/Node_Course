"use strict";
const { NotFoundError } = require("../core/error.response");
const Comment = require("../models/comment.model");
const { convertToObjMongo } = require("../utils");
const { findProduct } = require("../models/repositories/product.repo");
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const comment = new Comment({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });
    let rightValue;
    if (parentCommentId) {
      // reply comment
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      rightValue = parentComment.comment_right;
      await Comment.updateMany(
        {
          comment_productId: convertToObjMongo(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        }
      );
      await Comment.updateMany(
        {
          comment_productId: convertToObjMongo(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRightValue = await Comment.findOne(
        {
          comment_productId: convertToObjMongo(productId),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.right + 1;
      } else {
        rightValue = 1;
      }
    }
    // insert to comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;
    await comment.save();
    return comment;
  }

  // get CommentParent
  static async getCommentByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) throw new NotFoundError("Not found comment for product");
      const comments = await Comment.find({
        comment_productId: convertToObjMongo(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lte: parent.comment_right },
      })
        .select({
          comment_left: 1,

          comment_right: 1,
          comment_content: 1,
          content_parentId: 1,
        })
        .sort({
          comment_left: 1,
        });
      return comments;
    }
    const comments = await Comment.find({
      comment_productId: convertToObjMongo(productId),
      comment_parentId: parentCommentId,
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        content_parentId: 1,
      })
      .sort({
        comment_left: 1,
      });
    return comments;
  }

  // delete comment
  static async deleteComment({ productId, commentId }) {
    const foundProduct = await findProduct({
      product_id: productId,
    });
    if (!foundProduct) throw new NotFoundError("product is not found");
    const comment = await Comment.findById(commentId);
    if (!comment) throw new NotFoundError("Comment not found");
    // 1. Xac dinh gia tri left va right
    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;
    // 2. tinh width
    const width = rightValue - leftValue + 1;
    // 3. xoa tat ca commentId con
    await Comment.deleteMany({
      comment_productId: convertToObjMongo(productId),
      comment_left: { $gte: leftValue, $lte: rightValue },
    });
    // 4. cap nhat gia tri left va right
    await Comment.updateMany(
      {
        comment_productId: convertToObjMongo(productId),
        comment_right: { $gt: rightValue },
      },
      {
        $inc: { comment_right: -width },
      }
    );
    await Comment.updateMany(
      {
        comment_productId: convertToObjMongo(productId),
        comment_left: { $gt: rightValue },
      },
      {
        $inc: { comment_left: -width },
      }
    );
    return true;
  }
}
module.exports = CommentService;
