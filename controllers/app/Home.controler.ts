import { errRes, okRes } from "../../helpers/tools";
import { Category } from "../../src/entity/Category";
import { Invoice } from "../../src/entity/Invoice";
import { Method } from "../../src/entity/Method";
import { Product } from "../../src/entity/Product";

export default class HomeController {
  static async getCaegories(req, res): Promise<object> {
    let data: any;
    try {
      data = await Category.find({
        where: { active: true },
        relations: ["products"],
      });
    } catch (error) {
      return errRes(res, error);
    }
    return okRes(res, data);
  }
  static async getProducts(req, res): Promise<object> {
    let data: any;
    let category = req.params.category;
    const active = true;
    try {
      data = await Product.find({
        where: { active, category },
        relations: ["category"],
      });
    } catch (error) {
      return errRes(res, error);
    }
    return okRes(res, data);
  }
  static async getMethod(req, res): Promise<object> {
    let data: any;
    try {
      data = await Method.find({
        where: { active: true },
      });
    } catch (error) {
      return errRes(res, error);
    }
    return okRes(res, data);
  }
  static async getInvoices(req, res): Promise<object> {
    try {
      let data = await Invoice.find({
        where: { user: req.user },

        join: {
          alias: "invoice",
          leftJoinAndSelect: {
            user: "invoice.user",
            items: "invoice.items",
            product: "items.product",
          },
        },
      });
      return okRes(res, data);
    } catch (error) {
      return errRes(res, error);
    }
  }
}
