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

    let user: any;

    try {
      user = await User.findOne({ where: { phone: req.body.phone } });
      if (user) return errRes(res, `Phone ${req.body.phone} already exists`);
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
    });

    await user.save();
    // TODO: create JWT Token

    var token = jwt.sign({ id: user.id }, "shhhhh");

    return okRes(res, { data: user, token });
  }
  // TODO: check  OTP

  static async otp(req: Request, res: Response) {
    let token: any, payload: any;
    let user: any;
    token = req.headers.token;
    payload = jwt.verify(token, "shhhhh");

    user = await User.findOne({ where: { id: payload.id } });
    if (user.otp == req.headers.otp) {
      user.complete = true;
      await user.save();
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
    let user: any;
    try {
      user = await User.findOne({ where: { phone: userphone } });
      if (user) {
        if (!user.complete) {
          return errRes(res, "Please register ");
        } else {
          if (await bcrypt.compareSync(userpassword, user.password)) {
            var token = jwt.sign({ id: user.id }, "shhhhh");
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
  static async putCategory(req: Request, res: Response) {
    let notValid = validate(req.body, validation.category());
    if (notValid) return errRes(res, notValid);
    let category: any;
    try {
      category = await Category.findOne({ where: { title: req.body.title } });
      if (category)
        return errRes(res, `category ${req.body.title} already exists`);
    } catch (error) {
      return errRes(res, error);
    }
    category = await Category.create({
      ...req.body,
      active: true,
    });
    await category.save();
    return okRes(res, "successful");
  }
  static async getCategores(req: Request, res: Response) {
    let category: any;
    try {
      category = await Category.find({ where: { active: true } });
      if (category) return okRes(res, { category });
    } catch (error) {
      return errRes(res, error);
    }
  }

  static async addProduct(req: Request, res: Response) {
    let NotValid = validate(req.body, validation.product());
    if (NotValid) return errRes(res, NotValid);
    let product: any;
    try {
      product = await Product.findOne({ where: { name: req.body.name } });
      if (product) {
        return errRes(res, `This product already exist`);
      } else {
        product = await Product.create({
          ...req.body,
          active: true,
          category: 2,
        });
        await product.save();
        return okRes(res, { product });
      }
    } catch (error) {
      return errRes(res, error);
    }
  }
  static async getProduct(req: Request, res: Response) {
    let product: any;
    try {
      product = await Product.find({ where: { category: req.params.id } });
      if (product) {
        return okRes(res, product);
      } else {
        return errRes(res, "there is no product in this category");
      }
    } catch (error) {
      return errRes(res, error);
    }
  }
  static async addPayment(req: Request, res: Response) {
    let NotValid = validate(req.body, validation.payment());
    if (NotValid) return errRes(res, NotValid);

    let payment: any;

    payment = await Method.create({
      ...req.body,
      active: true,
    });
    await payment.save();
    return okRes(res, { payment });
  }
  static async getPayment(req: Request, res: Response) {
    let paymen: any;
    try {
      paymen = await Method.find({ where: { active: true } });
      if (paymen) {
        return okRes(res, paymen);
      } else {
        return errRes(res, "there is no payment  active");
      }
    } catch (error) {
      return errRes(res, error);
    }
  }
}
