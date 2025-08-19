const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_destination_schema = require("../models/cms_destinations.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_destination_Controller extends BaseController {
  async add_cms_destination(req, res) {
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

      const reqBodyData = req.body?.data && JSON.parse(req.body.data);
      const banners = req.body?.data && reqBodyData?.banners;
      const _banners = req.body?.data && reqBodyData?._banners;
      console.log(reqBodyData);

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        image: req.files?.image?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // BANNERS
      if (!_banners?.length && !req.files?.banners_img?.length) {
        // nothing
        console.log(1);
      } else if (_banners?.length) {
        if (req?.files?.banners_img?.length) {
          // old+new
          console.log(2);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.banners_img?.length) {
          // only new
          console.log(4);
          data.banners = [
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      const add_cms_destination = new cms_destination_schema(data);
      const Add_cms_destination = await add_cms_destination.save();
      // console.log(Add_cms_destination);
      Add_cms_destination.img = generateDownloadLink(Add_cms_destination.img);

      // Add_cms_destination.icon_img = generateDownloadLink(Add_cms_destination.icon_img);

      return this.sendJSONResponse(
        res,
        "Add cms_destination",
        {
          length: 1
        },
        Add_cms_destination
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_destination(req, res) {
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

      const display_cms_destination = await cms_destination_schema.find({ agency_id: tokenData.id, _id: _id });

      display_cms_destination[0].img =
        generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_destination[0].img;

      return this.sendJSONResponse(
        res,
        "display  cms_destination",
        {
          length: 1
        },
        display_cms_destination
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_destination(req, res) {
    try {
      // const is_deleted = req.query.is_deleted;
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

      let { limit, page, is_deleted } = req.query;
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
      let result;
      // let Data = [];
      if (is_deleted === "true") {
        // console.log("123");
        result = await cms_destination_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_destination_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     country: element.country,
        //     state: element.state,
        //     city: element.city,
        //     name: element.name,
        //     header: element.header,
        //     seo_url: element.seo_url,
        //     meta_keyword: element.meta_keyword,
        //     seo_title: element.seo_title,
        //     currency: element.currency,
        //     time_zone: element.time_zone,
        //     time_title: element.time_title,
        //     img: element.img,
        //     meta_description: element.meta_description,
        //     og_tag: element.og_tag,
        //     description: element.description,
        //     is_featured: element.is_featured,
        //     image: {
        //       name: element.image.name
        //       // img:req.files?.img?.map((file) => generateFilePathForDB(file))?.[0]
        //     },
        //     general_info: {
        //       month_heading: element.general_info.month_heading,
        //       title: element.general_info.title,
        //       festival: element.general_info.festival
        //     },
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await cms_destination_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_destination_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     country: element.country,
        //     state: element.state,
        //     city: element.city,
        //     name: element.name,
        //     header: element.header,
        //     seo_url: element.seo_url,
        //     meta_keyword: element.meta_keyword,
        //     seo_title: element.seo_title,
        //     currency: element.currency,
        //     time_zone: element.time_zone,
        //     time_title: element.time_title,
        //     img: element.img,
        //     meta_description: element.meta_description,
        //     og_tag: element.og_tag,
        //     description: element.description,
        //     is_featured: element.is_featured,
        //     image: {
        //       name: element.image.name
        //       // img:req.files?.img?.map((file) => generateFilePathForDB(file))?.[0]
        //     },
        //     general_info: {
        //       month_heading: element.general_info.month_heading,
        //       title: element.general_info.title,
        //       festival: element.general_info.festival
        //     },
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      for (let i = 0; i < result.length; i++) {
        result[i].image = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].image;
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

      const cms_destination = {
        cms_destinations: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cms_destination",
        {
          length: 1
        },
        cms_destination
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //   async display_all_cms_destination(req, res) {
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

  //       const display_cms_destination = await cms_destination_schema.aggregate([
  //         {
  //           $lookup: {
  //             from: "hotels",
  //             localField: "hotel",
  //             foreignField: "_id",
  //             as: "hotels"
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: "cms_destination_types",
  //             localField: "cms_destination_type",
  //             foreignField: "_id",
  //             as: "cms_destination_types"
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: "meal_plans",
  //             localField: "meal_plan",
  //             foreignField: "_id",
  //             as: "meal_plans"
  //           }
  //         }
  //       ]);
  //       for (let i = 0; i < display_cms_destination.length; i++) {
  //         display_cms_destination[i].thumb_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_destination[i].thumb_img;
  //       }
  //       for (let i = 0; i < display_cms_destination.length; i++) {
  //         display_cms_destination[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_destination[i].banner_img;
  //       }
  //       for (let i = 0; i < display_cms_destination.length; i++) {
  //         display_cms_destination[i].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_destination[i].currency_img;
  //       }

  //       const cms_destinations = {
  //         cms_destination: display_cms_destination
  //       };
  //       return this.sendJSONResponse(
  //         res,
  //         "display  cms_destination",
  //         {
  //           length: 1
  //         },
  //         cms_destinations
  //       );
  //     } catch (error) {
  //       if (error instanceof NotFound) {
  //         console.log(error); // throw error;
  //       }
  //       return this.sendErrorResponse(req, res, error);
  //     }
  //   }

  async update_cms_destination(req, res) {
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

      const reqBodyData = req.body?.data && JSON.parse(req.body.data);
      const banners = req.body?.data && reqBodyData?.banners;
      const _banners = req.body?.data && reqBodyData?._banners;
      console.log(reqBodyData);

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        image: req.files?.image?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // BANNERS
      if (!_banners?.length && !req.files?.banners_img?.length) {
        // nothing
        console.log(1);
      } else if (_banners?.length) {
        if (req?.files?.banners_img?.length) {
          // old+new
          console.log(2);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.banners_img?.length) {
          // only new
          console.log(4);
          data.banners = [
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      const update_cms_destination = await cms_destination_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        data
      );
      return this.sendJSONResponse(
        res,
        "update cms_destination",
        {
          length: 1
        },
        update_cms_destination
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_destination(req, res) {
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

      const Data = {
        is_deleted: true
      };

      const delete_cms_destination = await cms_destination_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_destination",
        {
          length: 1
        },
        delete_cms_destination
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
