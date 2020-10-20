import * as express from "express";
const router = express.Router();

import UserController from "../../controllers/app/user.controller";
import HomeController from "../../controllers/app/Home.controler";
import userAuth from "../../midllewear/app/userAuth";

// create v1
//// register
router.post("/register", UserController.register);
//For otp
router.post("/otp", UserController.otp);
//Login
router.post("/login", UserController.Login);
//make Invoice
router.post("/makeInvoices", userAuth, UserController.makeInvoice);
//user update
router.post("/update", userAuth, UserController.userUpdate);
//forget password
router.post("/password_reset", UserController.fotgetPassword);
// verfiy
router.post("/verify", UserController.verfiyPassword);
// ZC
router.post("/pay", userAuth, UserController.verfiyPassword);

// HOME CONTROLLERproducts
router.get("/getcategores", HomeController.getCaegories);
router.get("/product/:category", HomeController.getProducts);
router.get("/payment", HomeController.getMethod);
router.get("/invoices", userAuth, HomeController.getInvoices);

export default router;
