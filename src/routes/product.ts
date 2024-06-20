import express from "express";
import adminOnly from "../middlewares/auth.js";
import {
  getLatestProducts,
  newProduct,
  getAllCategories,
  getAdminProducts,
  getSingleProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "../controller/product.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

app.post("/new", adminOnly, singleUpload, newProduct);
//to get all products with filters
app.get("/all",getAllProducts)
app.get("/latest", getLatestProducts);
app.get("/categories", getAllCategories);
app.get("/admin-product",adminOnly, getAdminProducts);
app
  .route("/:id")
  .get(getSingleProducts)
  .put(adminOnly,singleUpload, updateProduct)
  .delete(adminOnly,deleteProduct);

export default app;
