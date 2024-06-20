import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import{ faker }from "@faker-js/faker"
import { myCache } from "../app.js";
import { InvalidateCacheProps } from "../types/types.js";
import { invalidateCache } from "../utils/features.js";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) { 
      return next(new ErrorHandler("please add photo", 400));
    }
    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("deleted");
      });
      return next(new ErrorHandler("please enter all fields", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });
    invalidateCache({product:true,admin:true})
    return res.status(201).json({
      success: true,
      message: "product created successfully",
    });
  }
);

export const getLatestProducts = TryCatch(
  async (req, res, next) => {
    let products
    if(myCache.has("latest-product")){
      products = JSON.parse(myCache.get("latest-product")as string)
    }else{
      products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-product",JSON.stringify(products))
    }

    return res.status(200).json({
      success: true,
      products,
    });
  }
);

export const getAllCategories = TryCatch(
  async (req, res, next) => {
    let categories
    if(myCache.has("categories")){
      categories = JSON.parse(myCache.get("categories")as string)
    }
    else{
      categories = await Product.distinct("category");
      myCache.set("categories",JSON.stringify(categories))
    }
    return res.status(200).json({
      success: true,
      categories,
    });
  }
);
export const getAdminProducts = TryCatch(
  async (req, res, next) => {
    let products
    if(myCache.has("all-products")){
      products = JSON.parse(myCache.get("all-products")as string)
    }
    else{
      products = await Product.find({});
      myCache.set("all-products",JSON.stringify(products))
    }

    return res.status(200).json({
      success: true,
      products,
    });
  }
);

export const getSingleProducts = TryCatch(async (req, res, next) => {
 let product
 const id = req.params.id
 if(myCache.has(`product-${id}`)){
   product = JSON.parse(myCache.get(`product-${id}`)as string)
  }
  else{
    product = await Product.findById(id);
     if (!product) {
       return next(new ErrorHandler("product not found", 400));
     }
     myCache.set(`product-${id}`,JSON.stringify(product))
   }
  return res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("product not found", 400));
  }
  if (photo) {
    rm(product.photo!, () => {
      console.log("old photo delted");
    });
    product.photo = photo.path;
  }
  if (name) product.name = name;
  if (category) product.category = category;
  if (stock) product.stock = stock;
  if (price) product.price = price;

  await product.save();
  invalidateCache({product:true,productId:String(product._id),admin:true})
  return res.status(200).json({
    success: true,
    message: "product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 400));
  }
  rm(product.photo!, () => {
    console.log("product deleted");
  });
  await product.deleteOne();
  invalidateCache({product:true,productId:String(product._id),admin:true})

  return res.status(200).json({
    success: true,
    message: "product deleted successfully",
  });
});

// search products controllers

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { category, price, search, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    // 1, 2, 3, 4, 5, 6, 7, 8
    // 9, 10, 11, 12, 13, 14, 15, 16
    // 17, 18, 19, 20, 21, 22, 23, 24  for skipping from the below formula
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};
    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
    .sort(sort && { price: sort === "asc" ? 1 : -1 })
    .limit(limit)
    .skip(skip)

    const [products,filteredProductOnly] = await Promise.all([
      productsPromise,
      Product.find(baseQuery)
    ])
    
    const totalPage = Math.ceil(filteredProductOnly.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage
    });
  }
);

// const generateRandomProducts = async(count : number=10)=>{
//   const products = []
//   for(let i = 0;i<count;i++){
//     const product = {
//       name : faker.commerce.productName(),
//       photo: "uploads\\7b5d0f5a-ac93-44b3-ae4a-6e5767486c02.png",
//       price : faker.commerce.price({min:1500,max:80000,dec:0}),
//       stock : faker.commerce.price({min:0,max:100,dec:0}),
//       category : faker.commerce.department(),
//       createdAt : new Date(faker.date.past()),
//       updatedAt : new Date(faker.date.recent()),
//       __v: 0,
//     }
//     products.push(product)
//   }
//   await Product.create(products)
//   console.log({success:true})
// }



// const deleteRandomProducts = async(count : number=10)=>{
//  const products = await Product.find({}).skip(2)
//  for(let i = 0;i<products.length;i++){
//   const product = products[i]
//   await product.deleteOne();
//  }
//  console.log({success:true})
// }
// deleteRandomProducts(38)