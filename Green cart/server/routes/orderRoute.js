import express from "express"
import authUser from "../middleware/AuthUser.js";
import { getAllOrders, getUserOrder, placeOrderCod, placeOrderStripe } from "../controllers/orderController.js";
import authSeller from "../middleware/AuthSeller.js";


const orderRouter = express.Router();

orderRouter.post('/cod',authUser,placeOrderCod)
orderRouter.get('/user',authUser,getUserOrder)
orderRouter.get('/seller',authSeller,getAllOrders)
orderRouter.post('/stripe',authUser,placeOrderStripe)


export default orderRouter;