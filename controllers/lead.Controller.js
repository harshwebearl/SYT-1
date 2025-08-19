// const BaseController = require("./BaseController");
// const Forbidden = require("../errors/Forbidden");
// const NotFound = require("../errors/NotFound");
// const lead_schema = require("../models/Lead_Schema");
// const userSchema = require("../models/usersSchema");
// const mongoose = require("mongoose");

// module.exports = class lead_Controller extends BaseController {
//   async add_leads(req, res) {
//     try {
//       const tokenData = req.userData;
//       if (tokenData === "") {
//         return res.status(401).json({
//           message: "Auth fail"
//         });
//       }
//       const userData = await userSchema.find({ _id: tokenData.id });
//       if (userData[0].role !== "agency") {
//         throw new Forbidden("you are not agency");
//       }

//       const data = {
//         agency_id: tokenData.id,
//         company_name: req.body.company_name,
//         name: req.body.name,
//         phone: req.body.phone,
//         email: req.body.email,
//         budget: req.body.budget,
//         requirement: req.body.requirement,
//         service: req.body.service,
//         ISD_code: req.body.ISD_code,
//         source: req.body.source,
//         customer_type: req.body.customer_type,
//         branch: req.body.branch,
//         childern: req.body.childern,
//         adult: req.body.adult,
//         travel_date: req.body.travel_date,
//         day: req.body.day,
//         cities: req.body.cities,
//         city_name: req.body.city_name,
//         stage: req.body.stage,
//         deadline_date: req.body.deadline_date
//       };
//       const Add_leads = new lead_schema(data);
//       const Add_Lead = await Add_leads.save();
//       return this.sendJSONResponse(
//         res,
//         "leads add",
//         {
//           length: 1
//         },
//         Add_Lead
//       );
//     } catch (error) {
//       if (error instanceof NotFound) {
//         console.log(error); // throw error;
//       }
//       return this.sendErrorResponse(req, res, error);
//     }
//   }

//   async display_lead(req, res) {
//     try {
//       const _id = req.query._id;
//       const tokenData = req.userData;
//       if (tokenData === "") {
//         return res.status(401).json({
//           message: "Auth fail"
//         });
//       }
//       const userData = await userSchema.find({ _id: tokenData.id });
//       if (userData[0].role !== "agency") {
//         throw new Forbidden("you are not agency");
//       }

//       const display_lead = await lead_schema.find({ agency_id: tokenData.id, _id: _id });

//       return this.sendJSONResponse(
//         res,
//         "display lead",
//         {
//           length: 1
//         },
//         display_lead
//       );
//     } catch (error) {
//       if (error instanceof NotFound) {
//         console.log(error); // throw error;
//       }
//       return this.sendErrorResponse(req, res, error);
//     }
//   }

//   async display_all_leads(req, res) {
//     try {
//       const tokenData = req.userData;
//       if (tokenData === "") {
//         return res.status(401).json({
//           message: "Auth fail"
//         });
//       }
//       const userData = await userSchema.find({ _id: tokenData.id });
//       if (userData[0].role !== "agency") {
//         throw new Forbidden("you are not agency");
//       }

//       const { is_deleted, only_unallocated, stage, customer_type, page, limit, offset } = req.query;

//       const pipeline = [];
//       pipeline.push(
//         {
//           $match: {
//             $and: [
//               { agency_id: mongoose.Types.ObjectId(tokenData?.id) },
//               { is_deleted: !!req.query.is_deleted },
//               ...(!!stage ? [{ stage: stage }] : []),
//               ...(!!customer_type ? [{ customer_type: customer_type }] : []),
//               ...(!!only_unallocated ? [{ allocated_to: { $exists: false } }] : [])
//             ]
//           }
//         },
//         {
//           $sort: {
//             _id: -1
//           }
//         }
//       );
//       pipeline.push(
//         // !Standard Lookup
//         // {
//         //   $lookup: {
//         //     from: "book_packages",
//         //     localField: "_id",
//         //     foreignField: "bid_package_id",
//         //     as: "book_package"
//         //   }
//         // }

//         // !CUSTOM PIPELINE
//         {
//           $lookup: {
//             from: "timelines",
//             // localField: "_id",
//             // foreignField: "lead_id",
//             let: { local_id: "$_id" },
//             as: "timelines",
//             pipeline: [
//               { $match: { $expr: { $eq: ["$$local_id", "$lead_id"] } } },
//               { $sort: { createdAt: 1 } },
//               // { $limit: 500 }
//               // { $sort: { _id: -1 } },
//               { $limit: 1 }
//             ]
//             // pipeline: [
//             //   { $sort: -1 },
//             //   { $limit: 1 }
//             // ]
//           }
//         }
//       );

//       const options = {
//         ...(!!page ? { page: page } : []),
//         ...(!!(limit && !isNaN(limit)) ? { limit: limit } : []),
//         ...(!!offset ? { offset: offset } : []),
//         ...(!!((limit && !isNaN(limit)) || (limit && !isNaN(limit))) && { pagination: false })
//       };
//       let result = await lead_schema.aggregatePaginate(lead_schema.aggregate(pipeline), options);

//       return this.sendJSONResponse(
//         res,
//         "leads display",
//         {
//           length: 1
//         },
//         {
//           data: result?.docs,
//           pageInfo: result?.pageInfo
//         }
//       );
//     } catch (error) {
//       if (error instanceof NotFound) {
//         console.log(error); // throw error;
//       }
//       return this.sendErrorResponse(req, res, error);
//     }
//   }

//   async update_leads(req, res) {
//     try {
//       const tokenData = req.userData;
//       if (tokenData === "") {
//         return res.status(401).json({
//           message: "Auth fail"
//         });
//       }
//       const userData = await userSchema.find({ _id: tokenData.id });
//       if (userData[0].role !== "agency") {
//         throw new Forbidden("you are not agency");
//       }

//       const _id = req.query._id;

//       const Data = {
//         company_name: req.body.company_name,
//         name: req.body.name,
//         phone: req.body.phone,
//         budget: req.body.budget,
//         requirement: req.body.requirement,
//         service: req.body.service,
//         source: req.body.source,
//         branch: req.body.branch,
//         customer_type: req.body.customer_type,
//         childern: req.body.childern,
//         adult: req.body.adult,
//         travel_date: req.body.travel_date,
//         day: req.body.day,
//         cities: req.body.cities,
//         city_name: req.body.city_name,
//         deadline_date: req.body.deadline_date,
//         ISD_code: req.body.ISD_code,
//         stage: req.body.stage,
//         is_deleted: req.body.is_deleted
//       };

//       const update_leads = await lead_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
//       return this.sendJSONResponse(
//         res,
//         "update leads",
//         {
//           length: 1
//         },
//         update_leads
//       );
//     } catch (error) {
//       if (error instanceof NotFound) {
//         console.log(error); // throw error;
//       }
//       return this.sendErrorResponse(req, res, error);
//     }
//   }

//   async allocatedleads(req, res) {
//     try {
//       const tokenData = req.userData;
//       if (tokenData === "") {
//         return res.status(401).json({
//           message: "Auth fail"
//         });
//       }
//       const userData = await userSchema.find({ _id: tokenData.id });
//       if (userData[0].role !== "agency") {
//         throw new Forbidden("you are not agency");
//       }

//       const _id = req.query._id;

//       const { leadId_list, memberId } = req.body;

//       const update_leads = await lead_schema.updateMany(
//         { agency_id: tokenData.id, _id: { $in: leadId_list } },
//         {
//           $set: { allocated_to: memberId }
//         }
//       );
//       return this.sendJSONResponse(
//         res,
//         "update leads",
//         {
//           length: 1
//         },
//         update_leads
//       );
//     } catch (error) {
//       if (error instanceof NotFound) {
//         console.log(error); // throw error;
//       }
//       return this.sendErrorResponse(req, res, error);
//     }
//   }

//   async delete_lead(req, res) {
//     try {
//       const _id = req.query._id;

//       const tokenData = req.userData;
//       if (tokenData === "") {
//         return res.status(401).json({
//           message: "Auth fail"
//         });
//       }
//       const userData = await userSchema.find({ _id: tokenData.id });
//       if (userData[0].role !== "agency") {
//         throw new Forbidden("you are not agency");
//       }

//       const data = {
//         is_deleted: true
//       };

//       const delete_lead = await lead_schema.findByIdAndUpdate({ _id: _id }, data);

//       return this.sendJSONResponse(
//         res,
//         "delete leads",
//         {
//           length: 1
//         },
//         delete_lead
//       );
//     } catch (error) {
//       if (error instanceof NotFound) {
//         console.log(error); // throw error;
//       }
//       return this.sendErrorResponse(req, res, error);
//     }
//   }
// };
