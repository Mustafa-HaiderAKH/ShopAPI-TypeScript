import * as express from "express";
const router = express.Router();

import UserController from "../../controllers/app/user.controller";

// create v1
//// register
router.post("/register", UserController.register);
//For otp
router.post("/otp", UserController.otp);
//Login
router.post("/login", UserController.Login);
//add new category
router.post("/category", UserController.putCategory);
//get categores
router.get("/getcategores", UserController.getCategores);
//add a new product
router.post("/addproduct", UserController.addProduct);
//get product in category
router.get("/product/:id", UserController.getProduct);
//add a new payment method
router.post("/addpayment", UserController.addPayment);
//get payment active
router.get("/payment", UserController.getPayment);

//// login
//// categories
//// category products
//// check out
//// invoices
//// methods
//// notifications

export default router;
