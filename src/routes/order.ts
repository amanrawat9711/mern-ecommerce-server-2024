import express from "express";
import adminOnly from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrder,
  myOrders,
  newOrder,
  processOrder,
  getSingleOrder,
} from "../controller/order.js";

const app = express.Router();
//     /api/v1/order/new
app.post("/new", newOrder);
app.get("/my", myOrders);
app.get("/all", adminOnly, allOrders);
app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, processOrder)
  .delete(adminOnly, deleteOrder);

export default app;
