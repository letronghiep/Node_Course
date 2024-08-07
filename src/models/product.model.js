const { Schema, Types, model } = require("mongoose"); // Erase if already required
const slugify = require("slugify");
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "products";

// Declare the Schema of the Mongo model
var productSchema = new Schema(
  {
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
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
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
productSchema.index({ product_name: "text", product_description: "text" });
// Document middleware: runs save(), create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

var clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "clothings",
    timestamps: true,
  }
);

var electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronic", electronicSchema),
};
