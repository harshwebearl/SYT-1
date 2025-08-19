const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const profile_setting_schema = require("../models/profile_setting.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "profile_setting";
module.exports = class profile_setting_Controller extends BaseController {
  async add_profile_setting(req, res) {
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
        company_detail: {
          company_name: req.body.company_detail.company_name,
          // logo: req.files?.logo?.map((file) => generateFilePathForDB(file))?.[0],
          logo: req.files.logo[0].filename,
          first_name: req.body.company_detail.first_name,
          last_name: req.body.company_detail.last_name,
          email: req.body.company_detail.email,
          contact_no: req.body.company_detail.contact_no,
          whatsapp_no: req.body.company_detail.whatsapp_no,
          address: req.body.company_detail.address
        },
        social_media_link: {
          facebook_url: req.body.social_media_link.facebook_url,
          twitter_url: req.body.social_media_link.twitter_url,
          instagram_url: req.body.social_media_link.instagram_url,
          linkedin_url: req.body.social_media_link.linkedin_url,
          google_url: req.body.social_media_link.google_url
        },
        associated_partner: {
          // partner_image: req.files?.partner_image?.map((file) => generateFilePathForDB(file))
          partner_image: req.files.partner_image[0].filename
        },
        mark_up_gst: {
          gst_on_markup: req.body.mark_up_gst.gst_on_markup
        },
        related_link: {
          related_link: req.body.related_link.related_link
        },
        tawk_script: {
          tawk_script: req.body.tawk_script.tawk_script
        },
        footer_content: {
          content: req.body.footer_content.content,
          want_to_display_logo: req.body.footer_content.want_to_display_logo,
          want_to_enable_auto_refund: req.body.footer_content.want_to_enable_auto_refund,
          want_to_enable_chat_in_quotation: req.body.footer_content.want_to_enable_chat_in_quotation,
          want_otp_authentication: req.body.footer_content.want_otp_authentication,
          pdf_colour_code: req.body.footer_content.pdf_colour_code
          // booking_setting: {
          //   online: req.body.footer_content.booking_setting.online,
          //   offline: req.body.footer_content.booking_setting.offline
          // }
        },
        account_information: {
          sr_no: req.body.account_information.sr_no,
          bank_name: req.body.account_information.bank_name,
          account_no: req.body.account_information.account_no,
          ifsc_code: req.body.account_information.ifsc_code,
          address: req.body.account_information.address
        }
      };

      const add_profile_setting = new profile_setting_schema(data);
      const Add_profile_setting = await add_profile_setting.save();
      // console.log(Add_profile_setting);
      //   Add_profile_setting.thumb_img = generateDownloadLink(Add_profile_setting.thumb_img);
      //   Add_profile_setting.banner_img = generateDownloadLink(Add_profile_setting.banner_img);
      //   Add_profile_setting.currency_img = generateDownloadLink(Add_profile_setting.currency_img);

      // Add_profile_setting.icon_img = generateDownloadLink(Add_profile_setting.icon_img);

      return this.sendJSONResponse(
        res,
        "Add profile_setting",
        {
          length: 1
        },
        Add_profile_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_profile_setting(req, res) {
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
      const result = await profile_setting_schema.find({ agency_id: tokenData.id }).sort({
        _id: -1
      });
      if (!!result?.length) {
        // result?.map((item) => ({
        //   ...item,
        //   logo: generateFileDownloadLinkPrefix(req.localHostURL) + item.logo,
        //   partner_img_1: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_1,
        //   partner_img_2: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_2,
        //   partner_img_3: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_3,
        //   partner_img_4: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_4
        // }));
        result?.map((item) => ({
          ...item,
          logo: generateFileDownloadLinkPrefix(req.localHostURL) + item.logo,
          partner_img_1: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_1,
          partner_img_2: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_2,
          partner_img_3: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_3,
          partner_img_4: generateFileDownloadLinkPrefix(req.localHostURL) + item.partner_img_4
        }));
      }
      // if (is_deleted === "true") {
      //   // console.log("123");
      //   result = await profile_setting_schema.aggregate([
      //     {
      //       $match: {
      //         $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
      //       }
      //     }
      //   ]);
      //   // productPaginate1 = await profile_setting_schema.aggregatePaginate(result, option);
      //   // productPaginate1.docs.forEach((element) => {
      //   //   Data.push({
      //   //     _id: element._id,
      //   //     agency_id: element.id,
      //   //     company_detail: {
      //   //       company_name: element.company_detail.company_name,
      //   //       logo: element.company_detail.logo,
      //   //       first_name: element.company_detail.first_name,
      //   //       last_name: element.company_detail.last_name,
      //   //       email: element.company_detail.email,
      //   //       contact_no: element.company_detail.contact_no,
      //   //       whatsapp_no: element.company_detail.whatsapp_no,
      //   //       address: element.company_detail.address
      //   //     },
      //   //     social_media_link: {
      //   //       facebook_url: element.social_media_link.facebook_url,
      //   //       twitter_url: element.social_media_link.twitter_url,
      //   //       instagram_url: element.social_media_link.instagram_url,
      //   //       linkedin_url: element.social_media_link.linkedin_url,
      //   //       google_url: element.social_media_link.google_url
      //   //     },
      //   //     associated_partner: {
      //   //       partner_image: element.associated_partner.partner_image
      //   //     },
      //   //     mark_up_gst: {
      //   //       gst_on_markup: element.mark_up_gst.gst_on_markup
      //   //     },
      //   //     related_link: {
      //   //       related_link: element.related_link.related_link
      //   //     },
      //   //     tawk_script: {
      //   //       tawk_script: element.tawk_script.tawk_script
      //   //     },
      //   //     footer_content: {
      //   //       content: element.footer_content.content,
      //   //       want_to_display_logo: element.footer_content.want_to_display_logo,
      //   //       want_to_enable_auto_refund: element.footer_content.want_to_enable_auto_refund,
      //   //       want_to_enable_chat_in_quotation: element.footer_content.want_to_enable_chat_in_quotation,
      //   //       want_otp_authentication: element.footer_content.want_otp_authentication,
      //   //       pdf_colour_code: element.footer_content.pdf_colour_code
      //   //     },
      //   //     account_information: {
      //   //       sr_no: element.account_information.sr_no,
      //   //       bank_name: element.account_information.bank_name,
      //   //       account_no: element.account_information.account_no,
      //   //       ifsc_code: element.account_information.ifsc_code,
      //   //       address: element.account_information.address
      //   //     }
      //   //   });
      //   // });
      // } else {
      //   // console.log("456");
      //   result = await profile_setting_schema.aggregate([
      //     {
      //       $match: {
      //         $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
      //       }
      //     }
      //   ]);
      //   // productPaginate1 = await profile_setting_schema.aggregatePaginate(result, option);
      //   // productPaginate1.docs.forEach((element) => {
      //   //   Data.push({
      //   //     _id: element._id,
      //   //     agency_id: element.id,
      //   //     company_detail: {
      //   //       company_name: element.company_detail.company_name,
      //   //       logo: element.company_detail.logo,
      //   //       first_name: element.company_detail.first_name,
      //   //       last_name: element.company_detail.last_name,
      //   //       email: element.company_detail.email,
      //   //       contact_no: element.company_detail.contact_no,
      //   //       whatsapp_no: element.company_detail.whatsapp_no,
      //   //       address: element.company_detail.address
      //   //     },
      //   //     social_media_link: {
      //   //       facebook_url: element.social_media_link.facebook_url,
      //   //       twitter_url: element.social_media_link.twitter_url,
      //   //       instagram_url: element.social_media_link.instagram_url,
      //   //       linkedin_url: element.social_media_link.linkedin_url,
      //   //       google_url: element.social_media_link.google_url
      //   //     },
      //   //     associated_partner: {
      //   //       partner_image: element.associated_partner.partner_image
      //   //     },
      //   //     mark_up_gst: {
      //   //       gst_on_markup: element.mark_up_gst.gst_on_markup
      //   //     },
      //   //     related_link: {
      //   //       related_link: element.related_link.related_link
      //   //     },
      //   //     tawk_script: {
      //   //       tawk_script: element.tawk_script.tawk_script
      //   //     },
      //   //     footer_content: {
      //   //       content: element.footer_content.content,
      //   //       want_to_display_logo: element.footer_content.want_to_display_logo,
      //   //       want_to_enable_auto_refund: element.footer_content.want_to_enable_auto_refund,
      //   //       want_to_enable_chat_in_quotation: element.footer_content.want_to_enable_chat_in_quotation,
      //   //       want_otp_authentication: element.footer_content.want_otp_authentication,
      //   //       pdf_colour_code: element.footer_content.pdf_colour_code
      //   //     },
      //   //     account_information: {
      //   //       sr_no: element.account_information.sr_no,
      //   //       bank_name: element.account_information.bank_name,
      //   //       account_no: element.account_information.account_no,
      //   //       ifsc_code: element.account_information.ifsc_code,
      //   //       address: element.account_information.address
      //   //     }
      //   //   });
      //   // });
      // }
      // for (let i = 0; i < result.length; i++) {
      //   result[i].company_detail.logo =
      //     generateFileDownloadLinkPrefix(req.localHostURL) + result[i].company_detail.logo;
      // }
      // for (let i = 0; i < result.length; i++) {
      //   result[i].associated_partner.partner_image =
      //     generateFileDownloadLinkPrefix(req.localHostURL) + result[i].associated_partner.partner_image;
      // }
      // for (let i = 0; i < Data.length; i++) {
      //   Data[i].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + Data[i].currency_img;
      // }

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

      const profile_setting = {
        profile_settings: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all profile_setting",
        {
          length: 1
        },
        profile_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_profile_setting(req, res) {
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

      const display_profile_setting = await profile_setting_schema.find({ agency_id: tokenData.id });

      // FIX THIS
      // display_profile_setting[0].company_details.logo =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_profile_setting[0]?.company_details?.logo;
      // display_profile_setting[0].associated_partner.partner_image =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_profile_setting[0]?.associated_partner?.partner_image;

      return this.sendJSONResponse(
        res,
        "display  profile_setting",
        {
          length: 1
        },
        display_profile_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_profile_setting(req, res) {
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
        company_detail: {
          company_name: req.body.company_detail.company_name,
          // logo: req.files?.logo?.map((file) => generateFilePathForDB(file))?.[0],
          logo: req.files?.logo?.[0]?.filename,
          first_name: req.body.company_detail.first_name,
          last_name: req.body.company_detail.last_name,
          email: req.body.company_detail.email,
          contact_no: req.body.company_detail.contact_no,
          whatsapp_no: req.body.company_detail.whatsapp_no,
          address: req.body.company_detail.address
        },
        social_media_link: {
          facebook_url: req.body.social_media_link.facebook_url,
          twitter_url: req.body.social_media_link.twitter_url,
          instagram_url: req.body.social_media_link.instagram_url,
          linkedin_url: req.body.social_media_link.linkedin_url,
          google_url: req.body.social_media_link.google_url
        },
        associated_partner: {
          // partner_image: req.files?.partner_image?.map((file) => generateFilePathForDB(file))?.[0]
          partner_image: req.files?.partner_image?.[0]?.filename
        },
        mark_up_gst: {
          gst_on_markup: req.body.mark_up_gst.gst_on_markup
        },
        related_link: {
          related_link: req.body.related_link.related_link
        },
        tawk_script: {
          tawk_script: req.body.tawk_script.tawk_script
        },
        footer_content: {
          content: req.body.footer_content.content,
          want_to_display_logo: req.body.footer_content.want_to_display_logo,
          want_to_enable_auto_refund: req.body.footer_content.want_to_enable_auto_refund,
          want_to_enable_chat_in_quotation: req.body.footer_content.want_to_enable_chat_in_quotation,
          want_otp_authentication: req.body.footer_content.want_otp_authentication,
          pdf_colour_code: req.body.footer_content.pdf_colour_code
          // booking_setting:{
          //   online:req.body.footer_content.booking_setting.online,
          //   offline:req.body.footer_content.booking_setting.offline,
          // },
        },
        account_information: {
          sr_no: req.body.account_information.sr_no,
          bank_name: req.body.account_information.bank_name,
          account_no: req.body.account_information.account_no,
          ifsc_code: req.body.account_information.ifsc_code,
          address: req.body.account_information.address
        },
        is_deleted: req.body.is_deleted
      };

      const update_profile_setting = await profile_setting_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update profile_setting",
        {
          length: 1
        },
        update_profile_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_profile_setting(req, res) {
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

      const delete_profile_setting = await profile_setting_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete profile_setting",
        {
          length: 1
        },
        delete_profile_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
