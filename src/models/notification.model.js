"use strict";
const { Types, model, Schema } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "notifications";
// Declare the Schema of the Mongo model

/* 
    ORDER-001: order successfully
    ORDER-002: order failed
    PROMOTION-001: new Promotion
    SHOP-001: new prod by User following

*/

var notificationSchema = new Schema(
  {
    notify_type: {
      type: String,
      enum: ["ORDER-001", "ORDER-002", "PROMOTION-001", "SHOP-001"],
      required: true,
    },
    notify_senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    notify_receiverId: {
      type: Number,
      required: true,
    },
    notify_content: {
      type: String,
      required: true,
    },
    notify_options: {
      type: Object,
      default: {},
    },
  },

  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, notificationSchema);
