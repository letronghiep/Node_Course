const { Schema, Types, model } = require("mongoose"); // Erase if already required
const slugify = require("slugify");
const DOCUMENT_NAME = "SPU";
const COLLECTION_NAME = "spues";

// Declare the Schema of the Mongo model
var spuSchema = new Schema(
  {
    product_id: {
      type: String,
      default: "",
    },
    product_name: {
      type: String,
      required: true,
    },
    product_slug: {
      type: String,
      unique: true,
    },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_category: {
      type: Array,
      default: [],
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    // product_type: {
    //   type: String,
    //   required: true,
    //   enum: ["Electronics", "Clothing", "Furniture"],
    // },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    /* 
    {
      attribute_id: 12345,  // style ao [han quoc, thoi trang...]
      attribute_values: [
        {
          value_id: 123
        }
      
      ]
    }
    */
    product_ratingAvg: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be above 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: {
      type: Array,
      default: [],
    },
    /* 
      tier_variations: [
        {
          image: [],
          name:'color',
          options: ['red', 'yellow', 'blue']
        },
        {
          name: "size",
          options: ["S", "M", "L"],
          images: []
        }

      
      ]
    
    */
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
spuSchema.index({ product_name: "text", product_description: "text" });
// Document middleware: runs save(), create()
spuSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});
//Export the model
module.exports = model(DOCUMENT_NAME, spuSchema);
