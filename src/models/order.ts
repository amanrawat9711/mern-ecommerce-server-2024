import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems:[{
        name:String,
        photo:String,
        price:Number,
        quantity:Number,
        productId:{
            type: mongoose.Types.ObjectId,
            ref:"Product"
        }
    }]
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", schema);
