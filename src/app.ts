import express, { NextFunction } from "express"
import { connectDB } from "./utils/features.js"
import { errorMiddleware } from "./middlewares/error.js"
import NodeCache from "node-cache"
import { config } from "dotenv"
import morgan from "morgan"
//importing routes

import userRoutes from "./routes/user.js"
import productRoutes from"./routes/product.js"
import orderRoutes from"./routes/order.js"
import paymentRoutes from"./routes/payment.js"
import dashboardRoutes from "./routes/stats.js"
import Stripe from "stripe"
import cors from "cors"
config({
  path : "./.env"
})

const port = 4000 || process.env.PORT
const mnongoURI = process.env.MONGO_URI || ""
const stripeKey = process.env.STRIPE_KEY || ""
connectDB(mnongoURI)
export const stripe = new Stripe(stripeKey)
export const myCache = new NodeCache()
const app = express()
app.use(express.json())
app.use(morgan("dev"))
app.use(cors())
//using routes

app.get("/",(req,res)=>{
    res.send("working with /api/v1")
})

app.use("/api/v1/user",userRoutes)
app.use("/api/v1/product",productRoutes)
app.use("/api/v1/order",orderRoutes)
app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1/dashboard",dashboardRoutes)
app.use("/uploads",express.static("uploads"))

app.use(errorMiddleware)

app.listen(port,()=>{
console.log(`server is listening to port ${port}`)
})