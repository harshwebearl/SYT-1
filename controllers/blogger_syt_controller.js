const BaseController = require("../controllers/BaseController");
const blogger_content_syt_schema = require("../models/blogger_content_syt_schema");
const blogger_syt_schema = require("../models/blogger_syt_schema");
const userSchema = require("../models/usersSchema");
const NotFound = require("../errors/NotFound");
const image_url = require("../update_url_path");
const Forbidden = require("../errors/Forbidden");
const fn = "blogger";
const mongoose = require("mongoose");

module.exports = class Blogger extends BaseController {
  async add_blogger(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const requiredFields = ["mobile_number", "state", "city", "country"];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            message: `${field} is required`
          });
        }
      }

      const blogger_data = {
        blog_owner_name: req.body.blog_owner_name,
        blog_owner_photo: req.file.filename,
        mobile_number: req.body.mobile_number,
        emai_id: req.body.emai_id,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country
      };

      const blogger_syt = new blogger_syt_schema(blogger_data);
      const blogger = await blogger_syt.save();

      if (blogger.length == 0) {
        throw new Forbidden("blogger not add! Please try again");
      }

      return this.sendJSONResponse(
        res,
        "Blogger Added!",
        {
          length: 1
        },
        blogger
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async add_blog_content(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const blog_data = {
        blog_title: req.body.blog_title,
        blog_title_photo: req.file.filename,
        blog_title_points: req.body.blog_title_points,
        blog_category: req.body.blog_category,
        blog_content: req.body.blog_content,
        blogger_syt_id: req.body.blogger_syt_id
      };

      const blog_syt = new blogger_content_syt_schema(blog_data);
      const blog = await blog_syt.save();

      if (blog.length == 0) {
        throw new Forbidden("blog content not add! Please try again");
      }

      return this.sendJSONResponse(
        res,
        "Blog Content Added!",
        {
          length: 1
        },
        blog
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async list_blogger(req, res) {
    try {
      const blog_content = await blogger_content_syt_schema.aggregate([
        {
          $lookup: {
            from: "blogger_syts",
            localField: "blogger_syt_id",
            foreignField: "_id",
            as: "blogger_syt"
          }
        }
      ]);

      for (let i = 0; i < blog_content.length; i++) {
        blog_content[i].blog_title_photo = await image_url(fn, blog_content[i].blog_title_photo);
        if (blog_content[i].blogger_syt.length > 0) {
          blog_content[i].blogger_syt[0].blog_owner_photo = await image_url(
            fn,
            blog_content[i].blogger_syt[0].blog_owner_photo
          );
        }
      }

      return this.sendJSONResponse(
        res,
        "List of Blog!",
        {
          length: 1
        },
        blog_content
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async detail_blogger(req, res) {
    try {
      const blogger_content_id = req.query._id;

      const blog_content = await blogger_content_syt_schema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(blogger_content_id) }
        },
        {
          $lookup: {
            from: "blogger_syts",
            localField: "blogger_syt_id",
            foreignField: "_id",
            as: "blogger_syt"
          }
        }
      ]);

      blog_content[0].blog_title_photo = await image_url(fn, blog_content[0].blog_title_photo);
      blog_content[0].blogger_syt[0].blog_owner_photo = await image_url(
        fn,
        blog_content[0].blogger_syt[0].blog_owner_photo
      );

      return this.sendJSONResponse(
        res,
        "Details of Blog!",
        {
          length: 1
        },
        blog_content
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_list_blogger(req, res) {
    try {
      const tokenData = req.userData;

      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const blogger_list = await blogger_syt_schema.find({});

      for (let i = 0; i < blogger_list.length; i++) {
        blogger_list[i].blog_owner_photo = await image_url(fn, blogger_list[i].blog_owner_photo);
      }

      return this.sendJSONResponse(
        res,
        "List of Blogger!",
        {
          length: 1
        },
        blogger_list
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_blogger_by_id(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const blogger_id = req.query._id;

      const result = await blogger_syt_schema.findById(blogger_id);

      result.blog_owner_photo = await image_url(fn, result.blog_owner_photo);

      return this.sendJSONResponse(
        res,
        "Details of Blogger!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_blog_content_list(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not  customer");
      }

      const result = await blogger_content_syt_schema.aggregate([
        {
          $lookup: {
            from: "blogger_syts",
            localField: "blogger_syt_id",
            foreignField: "_id",
            as: "blogger_details"
          }
        },
        {
          $addFields: {
            blogger_id: { $first: "$blogger_details._id" },
            blogger_name: { $first: "$blogger_details.blog_owner_name" },
            blogger_photo: { $first: "$blogger_details.blog_owner_photo" }
          }
        },
        {
          $project: {
            _id: 1,
            blog_title: 1,
            blog_title_photo: 1,
            blog_content: 1,
            createdAt: 1,
            blogger_id: 1,
            blogger_name: 1,
            blogger_photo: 1
          }
        }
      ]);

      for (let i = 0; i < result.length; i++) {
        result[i].blog_title_photo = await image_url(fn, result[i].blog_title_photo);
        result[i].blogger_photo = await image_url(fn, result[i].blogger_photo);
      }

      // result[0].blog_title_photo = await image_url(fn, result[0].blog_title_photo);

      // result[0].blogger_syt_details[0].blog_owner_photo = await image_url(
      //   fn,
      //   result[0].blogger_syt_details[0].blog_owner_photo
      // );

      return this.sendJSONResponse(
        res,
        "Details of Blog Content!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_blog_content_by_id_for_customer(req, res) {
    try {
      const blog_content_id = req.query._id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData[0].role);

      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      const result = await blogger_content_syt_schema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(blog_content_id)
          }
        },
        {
          $lookup: {
            from: "blogger_syts",
            localField: "blogger_syt_id",
            foreignField: "_id",
            as: "blogger_syt_details"
          }
        }
      ]);

      result[0].blog_title_photo = await image_url(fn, result[0].blog_title_photo);

      result[0].blogger_syt_details[0].blog_owner_photo = await image_url(
        fn,
        result[0].blogger_syt_details[0].blog_owner_photo
      );

      return this.sendJSONResponse(
        res,
        "Details of Blog Content!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_blog_content_by_id(req, res) {
    try {
      const blog_content_id = req.query._id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData[0].role);

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin ");
      }

      const result = await blogger_content_syt_schema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(blog_content_id)
          }
        },
        {
          $lookup: {
            from: "blogger_syts",
            localField: "blogger_syt_id",
            foreignField: "_id",
            as: "blogger_syt_details"
          }
        }
      ]);

      result[0].blog_title_photo = await image_url(fn, result[0].blog_title_photo);

      result[0].blogger_syt_details[0].blog_owner_photo = await image_url(
        fn,
        result[0].blogger_syt_details[0].blog_owner_photo
      );

      return this.sendJSONResponse(
        res,
        "Details of Blog Content!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_blog_content_by_blogger_id(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const blogger_id = req.query._id;
      const blog_content = await blogger_content_syt_schema.aggregate([
        {
          $match: {
            blogger_syt_id: mongoose.Types.ObjectId(blogger_id)
          }
        }
      ]);

      for (let i = 0; i < blog_content.length; i++) {
        blog_content[i].blog_title_photo = await image_url(fn, blog_content[i].blog_title_photo);
      }

      return this.sendJSONResponse(
        res,
        "List of Blog Content!",
        {
          length: 1
        },
        blog_content
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_blogger(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const blogger_id = req.query._id;

      const blogger_data = {
        blog_owner_name: req.body.blog_owner_name,
        blog_owner_photo: req.file.filename,
        mobile_number: req.body.mobile_number,
        emai_id: req.body.emai_id,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country
      };

      const blogger = await blogger_syt_schema.findByIdAndUpdate(blogger_id, blogger_data, { new: true });

      if (blogger.length == 0) {
        throw new Forbidden("Data Not updated ! please try again");
      }

      if (blogger.length == 0) {
        throw new Forbidden("blogger not add! Please try again");
      }

      return this.sendJSONResponse(
        res,
        "Blogger Data Updated!",
        {
          length: 1
        },
        blogger
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_blog_content(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const blog_content_id = req.query._id;

      const existing_blog_content = await blogger_content_syt_schema.findById(blog_content_id);
      if (!existing_blog_content) {
        return res.status(404).json({
          message: "Blog content not found"
        });
      }

      const blog_content_data = {
        blog_title: req.body.blog_title,
        blog_title_photo: req.file ? req.file.filename : existing_blog_content.blog_title_photo,
        blog_title_points: req.body.blog_title_points,
        blog_category: req.body.blog_category,
        blog_content: req.body.blog_content,
        blogger_syt_id: req.body.blogger_syt_id
      };

      const blog_content = await blogger_content_syt_schema.findByIdAndUpdate(blog_content_id, blog_content_data, {
        new: true
      });

      if (blog_content.length == 0) {
        throw new Forbidden("blog content not updated! Please try again");
      }

      return this.sendJSONResponse(
        res,
        "Blog Content Updated Succesfully!",
        {
          length: 1
        },
        blog_content
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_blogger(req, res) {
    try {
      const tokenData = req.userData;
      const blogger_id = req.query._id;

      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const result = await blogger_syt_schema.findByIdAndDelete(blogger_id);

      return this.sendJSONResponse(
        res,
        "Blogger Deleted!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_blog_content(req, res) {
    try {
      const tokenData = req.userData;
      const bloge_content_id = req.query._id;

      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const result = await blogger_content_syt_schema.findByIdAndDelete(bloge_content_id);

      return this.sendJSONResponse(
        res,
        "Blog Content Deleted!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
