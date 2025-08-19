const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_blogs_schema = require("../models/cms_blogs.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_blogs_Controller extends BaseController {
  async add_cms_blogs(req, res) {
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
      const contents = (req.body?.data && reqBodyData?.contents) || [];
      const _contents = (req.body?.data && reqBodyData?._contents) || [];
      const banners = (req.body?.data && reqBodyData?.banners) || [];
      const _banners = (req.body?.data && reqBodyData?._banners) || [];

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // CONTENTS
      if (!contents?.length && !req.files?.contents_img?.length) {
        // nothing
        console.log(1);
      } else if (contents?.length) {
        if (req?.files?.contents_img?.length) {
          // old+new
          console.log(2);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.contents_img?.length) {
          // only new
          console.log(4);
          data.contents = [
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }
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

      // console.log("123")
      const add_cms_blogs = new cms_blogs_schema(data);
      const Add_cms_blogs = await add_cms_blogs.save();
      console.log(Add_cms_blogs);
      Add_cms_blogs.img = generateDownloadLink(Add_cms_blogs.img);

      // Add_cms_blogs.icon_img = generateDownloadLink(Add_cms_blogs.icon_img);

      return this.sendJSONResponse(
        res,
        "Add cms_blogs",
        {
          length: 1
        },
        Add_cms_blogs
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_blogs(req, res) {
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

      const display_cms_blogs = await cms_blogs_schema.find({ agency_id: tokenData.id, _id: _id });

      display_cms_blogs[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_blogs[0].img;

      return this.sendJSONResponse(
        res,
        "display  cms_blogs",
        {
          length: 1
        },
        display_cms_blogs
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_blogs(req, res) {
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
      let result;
      // let Data = [];
      if (is_deleted === "true") {
        // console.log("123");
        result = await cms_blogs_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_blogs_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     name: element.name,
        //     seo_url: element.seo_url,
        //     meta_keyword: element.meta_keyword,
        //     title: element.title,
        //     subtitle: element.subtitle,
        //     h1: element.h1,
        //     h2: element.h2,
        //     h3: element.h3,
        //     meta_description: element.meta_description,
        //     og_tag: element.og_tag,
        //     img_name: element.img_name,
        //     img: element.img,
        //     img_title: element.img_title,
        //     // img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        //     alt_tag: element.alt_tag,
        //     overview: element.overview,
        //     is_featured: element.is_featured,
        //     content: {
        //       img_name: element.content.img_name,
        //       img: element.content.img,
        //       img_title: element.content.img_title,
        //       alt_tag: element.content.alt_tag,
        //       content: element.content.content
        //       // img:req.files?.img?.map((file) => generateFilePathForDB(file))?.[0]
        //     },
        //     banner_image: {
        //       img_name: element.banner_images.img_name,
        //       img: element.banner_images.title,
        //       img_title: element.banner_images.img_title,
        //       alt_tag: element.banner_images.alt_tag
        //     },
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await cms_blogs_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_blogs_schema.aggregatePaginate(result, option);
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
        result[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].img;
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

      const cms_blogs = {
        cms_blog: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cms_blogs",
        {
          length: 1
        },
        cms_blogs
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //   async display_all_cms_blogs(req, res) {
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

  //       const display_cms_blogs = await cms_blogs_schema.aggregate([
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
  //             from: "cms_blogs_types",
  //             localField: "cms_blogs_type",
  //             foreignField: "_id",
  //             as: "cms_blogs_types"
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
  //       for (let i = 0; i < display_cms_blogs.length; i++) {
  //         display_cms_blogs[i].thumb_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_blogs[i].thumb_img;
  //       }
  //       for (let i = 0; i < display_cms_blogs.length; i++) {
  //         display_cms_blogs[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_blogs[i].banner_img;
  //       }
  //       for (let i = 0; i < display_cms_blogs.length; i++) {
  //         display_cms_blogs[i].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_blogs[i].currency_img;
  //       }

  //       const cms_blogss = {
  //         cms_blogs: display_cms_blogs
  //       };
  //       return this.sendJSONResponse(
  //         res,
  //         "display  cms_blogs",
  //         {
  //           length: 1
  //         },
  //         cms_blogss
  //       );
  //     } catch (error) {
  //       if (error instanceof NotFound) {
  //         console.log(error); // throw error;
  //       }
  //       return this.sendErrorResponse(req, res, error);
  //     }
  //   }

  async update_cms_blogs(req, res) {
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
      const contents = (req.body?.data && reqBodyData?.contents) || [];
      const _contents = (req.body?.data && reqBodyData?._contents) || [];
      const banners = (req.body?.data && reqBodyData?.banners) || [];
      const _banners = (req.body?.data && reqBodyData?._banners) || [];

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // CONTENTS
      if (!contents?.length && !req.files?.contents_img?.length) {
        // nothing
        console.log(1);
      } else if (contents?.length) {
        if (req?.files?.contents_img?.length) {
          // old+new
          console.log(20, _contents);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.contents_img?.length) {
          // only new
          console.log(4);
          data.contents = [
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }
      // BANNERS
      if (!_banners?.length && !req.files?.banners_img?.length) {
        // nothing
        console.log(1);
      } else if (_banners?.length) {
        if (req?.files?.banners_img?.length) {
          // old+new
          console.log(23);
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

      const update_cms_blogs = await cms_blogs_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, data);
      return this.sendJSONResponse(
        res,
        "update cms_blogs",
        {
          length: 1
        },
        update_cms_blogs
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      console.log(error?.stack);
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_blogs(req, res) {
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

      const delete_cms_blogs = await cms_blogs_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_blogs",
        {
          length: 1
        },
        delete_cms_blogs
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
