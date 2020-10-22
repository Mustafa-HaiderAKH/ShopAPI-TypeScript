import { Request, Response } from "express";
import { okRes, errRes, getOTP, hashMyPassword } from "../../helpers/tools";
import * as validate from "validate.js";
import validation from "../../helpers/validation.helper";
import { User } from "../../src/entity/User";
import { Category } from "../../src/entity/Category";
import PhoneFormat from "../../helpers/phone.helper";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { Product } from "../../src/entity/Product";
import { Method } from "../../src/entity/Method";
import config from "../../config/config";
import { Invoice } from "../../src/entity/Invoice";
import { InvoiceItem } from "../../src/entity/InvoiceItem";
import { Any } from "typeorm";
import * as ZC from "zaincash";

/**
 *
 */
export default class UserController {
  /**
   *
   * @param req
   * @param res
   */
  static async register(req: Request, res: Response): Promise<object> {
    let notValid = validate(req.body, validation.register());
    if (notValid) return errRes(res, notValid);
    let phoneObj = PhoneFormat.getAllFormats(req.body.phone);
    if (!phoneObj.isNumber)
      return errRes(res, `Phone ${req.body.phone} is not a valid`);

    let phone = phoneObj.globalP;
    let user: any;

    try {
      user = await User.findOne({ where: { phone } });
      if (user) {
        //check user if complete otp
        if (user.complete) {
          return errRes(res, `Phone ${req.body.phone} already exists`);
        }
        //if user is not in DB
        var token = jwt.sign({ id: user.id }, config.jwtsecret);
        // re write a  otp
        user.otp = getOTP();
        await user.save();
        user.password = null;
        user.otp = null;
        return okRes(res, { user, token });
      }
    } catch (error) {
      return errRes(res, error);
    }

    // TODO: Hash the password
    let hashPassword = await hashMyPassword(req.body.password);

    user = await User.create({
      ...req.body,
      password: hashPassword,
      active: true,
      complete: false,
      otp: getOTP(),
      phone,
    });

    await user.save();

    //to avoid return password in postamn
    user.password = null;
    user.otp = null;

    // TODO: create JWT Token

    var token = jwt.sign({ id: user.id }, config.jwtsecret);
    return okRes(res, { data: { user, token } });
  }
  // TODO: check  OTP

  static async otp(req: Request, res: Response) {
    let notValid = validate(req.body, validation.otp());
    if (notValid) return errRes(res, notValid);
    let token, payload: any;
    let user: any;
    token = req.headers.token;
    try {
      payload = jwt.verify(token, config.jwtsecret);
    } catch (error) {
      return errRes(res, "Invalid  token");
    }

    user = await User.findOne({ where: { id: payload.id } });
    if (!user) return errRes(res, "User does not exist");
    // check if user complete = true
    if (user.complete) return errRes(res, "User already complete");
    // compare the OTPs
    if (user.otp == req.body.otp) {
      user.complete = true;
      await user.save();
      user.password = null;
      return okRes(res, "correct");
    } else {
      user.otp = null;
      await user.save();
      return errRes(res, "incorrect");
    }
  }
  static async Login(req: Request, res: Response) {
    let userphone = req.body.phone;
    let userpassword = req.body.password;
    let notValid = validate(req.body, validation.login());
    if (notValid) return errRes(res, notValid);
    let phoneObj = PhoneFormat.getAllFormats(req.body.phone);
    if (!phoneObj.isNumber)
      return errRes(res, `Phone ${req.body.phone} is not a valid`);
    const phone = phoneObj.globalP;
    let user: any;
    try {
      user = await User.findOne({ where: { phone: userphone } });
      if (user) {
        if (!user.complete) {
          return errRes(res, "Please register ");
        } else {
          if (await bcrypt.compareSync(userpassword, user.password)) {
            var token = jwt.sign({ id: user.id }, config.jwtsecret);
            return okRes(res, { token });
          } else {
            return errRes(res, "in correct password");
          }
        }
      }
    } catch (error) {
      return errRes(res, error);
    }
  }

  static async makeInvoice(req, res) {
    let notValid = validate(req.body, validation.makeInvoice());
    if (notValid) return errRes(res, notValid);
    let ids = [];
    for (let product of req.body.products) {
      let notValid = validate(product, validation.oneProduct());
      if (notValid) return errRes(res, notValid);
      ids.push(product);
    }

    // get the user let user = req.user

    let user = req.user;
    let products = await Product.findByIds(ids);
    let total = 0;

    //  calculate the total from the products
    for (const product of products) {
      total =
        total +
        product.price *
          req.body.products.filter((e) => e.id == product.id)[0].quantity;
    }
    let invoice: any;
    invoice = await Invoice.create({
      ...req.body,
      total,
      status: "pending",
      user,
    });
    //create zain cash
    const paymentData = {
      amount: 2500,
      orderId: invoice.id,
      serviceType: "some serviceType",
      redirectUrl: "http://localhost:3000/v1/zc/redirect",
      production: false,
      msisdn: "9647835077880",
      merchantId: "5dac4a31c98a8254092da3d8",
      secret: "$2y$10$xlGUesweJh93EosHlaqMFeHh2nTOGxnGKILKCQvlSgKfmhoHzF12G",
      lang: "ar",
    };
    let zc = new ZC(paymentData);
    let zcTransactionid;
    try {
      zcTransactionid = await zc.init();
    } catch (error) {
      return errRes(res, error);
    }
    let url = `https://test.zaincash.iq/transaction/pay?id=${zcTransactionid}`;
    invoice.transactionId = zcTransactionid;
    await invoice.save();
    // create invoice item
    for (const product of products) {
      let invoiceItem: any;

      invoiceItem = await InvoiceItem.create({
        quantity: req.body.products.filter((e) => e.id == product.id)[0]
          .quantity,
        invoice,
        subtotal:
          req.body.products.filter((e) => e.id == product.id)[0].quantity *
          product.price,
        product,
      });
      await invoiceItem.save();
    }
    return okRes(res, { invoice, url });
  }
  static async userUpdate(req, res) {
    let user = req.user;
    let newuser = req.body;

    let notValid = validate(req.body, validation.userUpdate());
    if (notValid) return errRes(res, notValid);
    // check  phone is valid
    if (newuser.phone) {
      let phoneObj = PhoneFormat.getAllFormats(newuser.phone);
      if (!phoneObj.isNumber)
        return errRes(res, `Phone ${req.body.phone} is not a valid`);
      // check if phone already used in DB
      try {
        let usercheck = await User.findOne({
          where: { phone: phoneObj.globalP },
        });
        newuser.phone = phoneObj.globalP;
        if (usercheck) return errRes(res, "This phone already used");
      } catch (error) {
        return errRes(res, error);
      }
    }
    Object.keys(newuser).forEach((el) => {
      user[el] = newuser[el];
    });
    await user.save();
    return okRes(res, "Update successful");
  }
  /**
   *
   * @param req
   * @param res
   */
  static async fotgetPassword(req, res): Promise<object> {
    let user: any;
    let notValid = validate(req.body, validation.forgetpassword());
    if (notValid) return errRes(res, notValid);
    let phoneObj = PhoneFormat.getAllFormats(req.body.phone);
    if (!phoneObj.isNumber)
      return errRes(res, `Phone ${req.body.phone} is not a valid`);
    let phone = phoneObj.globalP;
    try {
      user = await User.findOne({
        where: { phone, complete: true, active: true },
      });
      if (!user) return errRes(res, "please complete Regsiter");
    } catch (error) {
      return errRes(res, error);
    }
    let token = jwt.sign({ phone }, config.jwtsecret);
    user.otp = getOTP();
    await user.save();

    return okRes(res, { token });
  }
  static async verfiyPassword(req, res) {
    let notValid = validate(req.body, validation.otp());
    if (notValid) return errRes(res, notValid);
    let token, payload: any;
    let user: any;
    token = req.headers.token;
    if (!token) return errRes(res, "please send token");
    try {
      payload = jwt.verify(token, config.jwtsecret);
    } catch (error) {
      return errRes(res, "Invalid  token");
    }
    try {
      user = await User.findOne({ where: { phone: payload.phone } });
      if (!user) return errRes(res, "error user not exist");
    } catch (error) {
      return errRes(res, error);
    }
    if (req.body.otp == user.otp) {
      let hashPassword = await hashMyPassword(req.body.newpassword);
      user.password = hashPassword;
      await user.save();
      return okRes(res, "password changed successfuly");
    }
    user.otp = null;
    await user.save();
    return errRes(res, { msg: "code is not valid" });
  }
  static async zcRedirect(req, res): Promise<object> {
    const token = req.query.token;
    let payload: any;
    try {
      payload = jwt.verify(
        token,
        "$2y$10$xlGUesweJh93EosHlaqMFeHh2nTOGxnGKILKCQvlSgKfmhoHzF12G"
      );
    } catch (error) {
      return errRes(res, error);
    }
    const id = payload.orderid;

    let invoice = await Invoice.findOne(id);
    if (!invoice) return errRes(res, "No such invoice");
    if (payload.status == "success") {
      invoice.status = "paid";
      invoice.zcOperation = payload.operationid;
      invoice.zcMsisdn = payload.msisdn;
      await invoice.save();
      return okRes(res, invoice);
    }
    invoice.status = payload.status;
    invoice.zcOperation = payload.operationid;
    await invoice.save();
    return okRes(res, invoice);
  }
}
