const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const invoice_schema = require("../models/invoice.schema");
const mongoose = require("mongoose");
const userSchema = require("../models/usersSchema");
const fs = require("fs");
const path = require("path");
const { ISOToIST } = require("../utils/dateTime");
const easyinvoice = require("easyinvoice");

module.exports = class Invoice_Controller extends BaseController {
  async add_invoice(req, res) {
    try {
      console.log(1);
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const data = {
        agency_id: tokenData.id,
        title: req.body.title,
        invoice_no: req.body.invoice_no,
        issue_date: req.body.issue_date,
        due_date: req.body.due_date,
        description: req.body.description,
        currency: req.body.currency,
        from_name: req.body.from_name,
        addressline1: req.body.addressline1,
        addressline2: req.body.addressline2,
        to_customer: req.body.to_customer,
        customer: req.body.customer,
        customerId: req.body.customer?._id,
        note: req.body.note,
        items: req.body.items,
        status: req.body.status,
        sub_total: req.body.sub_total,
        tax_total: req.body.tax_total,
        total_amount: req.body.total_amount,
        received_amount: req.body.received_amount,
        net_amount: req.body.net_amount,
        lead_id: req.body.lead_id
      };
      const Add_invoice = new invoice_schema(data);
      const add_invoice = await Add_invoice.save();
      return this.sendJSONResponse(
        res,
        "invoice add",
        {
          length: 1
        },
        add_invoice
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_invoice(req, res) {
    try {
      const _id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const display_invoice = await invoice_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  invoice",
        {
          length: 1
        },
        display_invoice
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_invoice(req, res) {
    try {
      const is_deleted = req.query.is_deleted;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      // let { limit, page, is_deleted } = req.query;
      // if ([null, undefined, ""].includes(page)) {
      //   page = 1;
      // }
      // if ([null, undefined, "", 1].includes(limit)) {
      //   limit = 50;
      // }
      // const option = {
      //   limit: limit,
      //   page: page
      // };

      // let productPaginate1;
      // let Data = [];
      let result;
      if (is_deleted === "true") {
        // console.log("123");
        result = await invoice_schema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: true },
                { agency_id: mongoose.Types.ObjectId(tokenData.id) },
                ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
              ]
            }
          },
          {
            $sort: {
              _id: -1
            }
          },
          {
            $lookup: {
              from: "leads",
              localField: "lead_id",
              foreignField: "_id",
              as: "leads"
            }
          }
        ]);
        // productPaginate1 = await invoice_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     ref_no: element.ref_no,
        //     date: element.date,
        //     due: element.due,
        //     details: element.details,
        //     client: element.client,
        //     status: element.status,
        //     total: element.total,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await invoice_schema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: { $ne: true } },
                { agency_id: mongoose.Types.ObjectId(tokenData.id) },
                ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
              ]
            }
          },
          {
            $sort: {
              _id: -1
            }
          },
          {
            $lookup: {
              from: "leads",
              localField: "lead_id",
              foreignField: "_id",
              as: "leads"
            }
          }
        ]);
        // productPaginate1 = await invoice_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     ref_no: element.ref_no,
        //     date: element.date,
        //     due: element.due,
        //     details: element.details,
        //     client: element.client,
        //     status: element.status,
        //     total: element.total,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // const pageInfo = {};
      // pageInfo.totalDocs = productPaginate1.totalDocs;
      // pageInfo.limit = productPaginate1.limit;
      // pageInfo.page = productPaginate1.page;
      // pageInfo.totalPages = productPaginate1.totalDocs;
      // pageInfo.pagingCounter = productPaginate1.pagingCounter;
      // pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
      // pageInfo.hasNextPage = productPaginate1.hasNextPage;
      // pageInfo.prevPage = productPaginate1.prevPage;
      // pageInfo.nextPage = productPaginate1.nextPage;

      const invoice = {
        invoices: result
        // pageInfo: pageInfo
      };
      return this.sendJSONResponse(
        res,
        "invoice display",
        {
          length: 1
        },
        invoice
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_invoice(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }
      const _id = req.query._id;
      console.log(_id);

      const Data = {
        title: req.body.title,
        invoice_no: req.body.invoice_no,
        issue_date: req.body.issue_date,
        due_date: req.body.due_date,
        description: req.body.description,
        currency: req.body.currency,
        from_name: req.body.from_name,
        addressline1: req.body.addressline1,
        addressline2: req.body.addressline2,
        to_customer: req.body.to_customer,
        customer: req.body.customer,
        customerId: req.body.customer?._id,
        note: req.body.note,
        items: req.body.items,
        status: req.body.status,
        sub_total: req.body.sub_total,
        tax_total: req.body.tax_total,
        total_amount: req.body.total_amount,
        received_amount: req.body.received_amount,
        net_amount: req.body.net_amount,
        is_deleted: req.body.is_deleted
      };

      const update_invoice = await invoice_schema.findByIdAndUpdate({ _id: _id }, Data);
      return this.sendJSONResponse(
        res,
        "update invoice",
        {
          length: 1
        },
        update_invoice
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async partialpayment(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }
      const _id = req.query._id;
      console.log(_id);

      const Data = {
        payment_details: req.body.payment_details
      };

      const update_invoice = await invoice_schema.updateOne(
        { _id: _id },
        {
          $push: { payment_details: req.body.payment_details },
          $inc: {
            received_amount: !req.body.payment_details?.amount_received ? 0 : req.body.payment_details?.amount_received,
            net_amount: !req.body.payment_details?.amount_received ? 0 : -req.body.payment_details?.amount_received
          }
        }
      );
      const update_invoice2 = await invoice_schema.updateOne({ _id: _id }, [
        {
          $set: {
            status: {
              $cond: [{ $lt: ["$net_amount", 0] }, "paid", "unpaid"]
            }
          }
        }
      ]);
      console.log(22, update_invoice2);
      const nvoicedata = await invoice_schema.findById(_id);
      console.log(nvoicedata);
      return this.sendJSONResponse(
        res,

        "update invoice",
        {
          length: 1
        },
        update_invoice
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_invoice_status(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const _id = req.query._id;

      const Data = {
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      const update_invoice_status = await invoice_schema.findByIdAndUpdate({ _id: _id }, Data);
      return this.sendJSONResponse(
        res,
        "update invoice",
        {
          length: 1
        },
        update_invoice_status
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async generateinvoice(req, res) {
    try {
      await easyinvoice.createInvoice(req.body.data, function (result) {
        /*  
          5.  The 'result' variable will contain our invoice as a base64 encoded PDF
              Now let's save our invoice to our local filesystem so we can have a look!
              We will be using the 'fs' library we imported above for this.
      */
        fs.writeFileSync("public/invoice.pdf", result.pdf, "base64");
        // res.attachment(`${invoice.pdf}`);
        // return result.write(res).then(() => res.end());
      });

      // throw Error("Something went wrong!1");
      let filePath = path.join(__dirname, "../public/", "invoice.pdf");

      return res.download(filePath);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_invoice(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const _id = req.query._id;

      const data = {
        is_deleted: true
      };

      // const delete_invoice = await invoice_schema.findByIdAndUpdate({ _id: _id }, data);
      const delete_invoice = await invoice_schema.findByIdAndDelete({ _id: _id }, data);

      return this.sendJSONResponse(
        res,
        "delete invoice",
        {
          length: 1
        },
        delete_invoice
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
