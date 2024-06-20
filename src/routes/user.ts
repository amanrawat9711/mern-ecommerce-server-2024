import  express  from "express";
import { getAllUsers, getUsers, newUser,deleteUser  } from "../controller/user.js";
import adminOnly from "../middlewares/auth.js";


const app = express.Router()
//     /api/v1/user/new
app.post("/new",newUser)

//     /api/v1/user/all
app.get("/all",adminOnly,getAllUsers)


//     /api/v1/user/:id
//     /api/v1/user/:id
app.route("/:id").get(getUsers).delete(adminOnly,deleteUser)

export default app;