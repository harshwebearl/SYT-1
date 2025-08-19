const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_gallery_schema = require("../models/cms_gallery.Schema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_gallery_Controller extends BaseController {
  async add_cms_gallery(req, res) {
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

      const data = {
        agency_id: tokenData.id,
        name: req.body.name,
        // banner_img: req.files?.banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        banner_img: req.files?.banner_img?.map((file) => file.filename)?.[0],
        // logo_img: req.files?.logo_img?.map((file) => generateFilePathForDB(file))?.[0],
        logo_img: req.files?.logo_img?.map((file) => file.filename)?.[0],
        description: req.body.description,
        images: (!!req.body?.images ? JSON.parse(req.body?.images) : undefined)?.map((item, index) => {
          return {
            name: item?.name,
            img: generateFilePathForDB(req.files?.img[index])
          };
        })
      };

      //  const img = [];
      //   for (let i = 0; i < req.files.img.length; i++) {
      //     img.push(
      //       data.img +
      //         "/" +
      //         (req?.files?.img?.[i]?.filename ||
      //           req?.files?.img?.[i]?.key?.substring(req?.files?.img?.[i]?.key?.lastIndexOf("/") + 1))
      //     );
      //     console.log(
      //       "\nFilename:",
      //       req?.files?.img?.[i]?.filename ||
      //         req?.files?.img?.[i]?.key?.substring(req?.files?.img?.[i]?.key?.lastIndexOf("/") + 1),
      //       "\nFilepath:",
      //       req?.files?.img?.[i]?.path || req?.files?.img?.[i]?.key
      //     );
      // }
      // // console.log(photo);
      // data.img = img;

      //   for (var i = 0; i < data.length; i += 1) {
      //     var fruit = getRandomItem(fruitsArray);
      //     data[i].innerHTML = fruit.name + '<img src="'+fruit.image+'">';
      // }

      // for (let i = 0; i < data.length; i++) {
      //   for(let j=0; j< data[i].images.length; j++){
      //     data[i].images[j].img =req.files?.images.img?.map((file) => generateFilePathForDB(file))?.[0]
      //   }
      // }

      const add_cms_gallery = new cms_gallery_schema(data);
      const Add_cms_gallery = await add_cms_gallery.save();

      return this.sendJSONResponse(
        res,
        "add cms_gallery ",
        {
          length: 1
        },
        Add_cms_gallery
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_gallery(req, res) {
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

      const display_cms_gallery = await cms_gallery_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_cms_gallery[0].banner_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_gallery[0].banner_img;

      // display_cms_gallery[0].logo_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_gallery[0].logo_img;

      display_cms_gallery[0].banner_img = await image_url("cms_gallery", display_cms_gallery[0].banner_img);
      display_cms_gallery[0].logo_img = await image_url("cms_gallery", display_cms_gallery[0].logo_img);

      return this.sendJSONResponse(
        res,
        "display  cms_gallery",
        {
          length: 1
        },
        display_cms_gallery
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_gallery(req, res) {
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
        result = await cms_gallery_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_gallery_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     name: element.name,
        //     banner_img: element.banner_img,
        //     logo_img: element.logo_img,
        //     description: element.description,
        //     images: {
        //       name: element.images.name
        //     },
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await cms_gallery_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_gallery_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     name: element.name,
        //     banner_img: element.banner_img,
        //     logo_img: element.logo_img,
        //     description: element.description,
        //     images: {
        //       name: element.images.name
        //     },
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      for (let i = 0; i < result.length; i++) {
        // result[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].banner_img;
        result[i].banner_img = await image_url("cms_gallery", result[i].banner_img);
      }
      for (let i = 0; i < result.length; i++) {
        result[i].logo_img = await image_url("cms_gallery", result[i].logo_img);
      }
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].images.length; j++) {
          result[i].images[j].img = await image_url("cms_gallery", result[i].images[j].img);
        }
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

      const cms_gallery = {
        cms_gallery: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cms_gallery",
        {
          length: 1
        },
        cms_gallery
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_gallery(req, res) {
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
      console.log(req.files?.banner_img?.[0]?.filename);
      const Data = {
        name: req.body.name,
        // banner_img: req.files?.banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        // logo_img: req.files?.logo_img?.map((file) => generateFilePathForDB(file))?.[0],
        banner_img: req.files?.banner_img?.[0]?.filename,
        logo_img: req.files?.logo_img?.[0]?.filename,
        description: req.body.description,
        // images: (!!req.body?.images ? JSON.parse(req.body?.images) : undefined)?.map((item, index) => {
        //   return {
        //     name: item?.name,
        //     img: generateFilePathForDB(req.files?.img[index])
        //   };
        // }),
        // images:req.files?.img?.map((item) =>(item.filename)),
        is_deleted: req.body.is_deleted
      };

      const update_cms_gallery = await cms_gallery_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_gallery",
        {
          length: 1
        },
        update_cms_gallery
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_gallery(req, res) {
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

      const delete_cms_gallery = await cms_gallery_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_gallery",
        {
          length: 1
        },
        delete_cms_gallery
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
