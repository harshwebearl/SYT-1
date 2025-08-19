const highlights_schema = require("../models/highlights_schema");
const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const userSchema = require("../models/usersSchema");
const image_url = require("../update_url_path.js");
const fn = "highlights";
module.exports = class highlights_controller extends BaseController {
  async add_highlight(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const highlight = {
        title: req.body.title,
        icon: req.file.filename
      };

      const new_highlight = new highlights_schema(highlight);

      const result = await new_highlight.save();

      if (result.length == 0) {
        throw new Forbidden("Highlight not saved ! please insert again");
      }

      return this.sendJSONResponse(
        res,
        "Highlight Added Succesfully !",
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

  async get_highlight(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const highlight_data = await highlights_schema.find();
      if (highlight_data.length == 0) {
        throw new Forbidden("No Highlight Found");
      }
      for (let i = 0; i < highlight_data.length; i++) {
        highlight_data[i].icon = await image_url(fn, highlight_data[i].icon);
      }
      return this.sendJSONResponse(
        res,
        "Highlights Data!",
        {
          length: 1
        },
        highlight_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_detail_highlight(req, res) {
    try {
      const highlight_id = req.query._id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const highlight_data = await highlights_schema.findOne({ _id: highlight_id });
      if (highlight_data.length == 0) {
        throw new Forbidden("No Highlight Found");
      }
      highlight_data.icon = await image_url(fn, highlight_data.icon);

      return this.sendJSONResponse(
        res,
        "Highlights Data!",
        {
          length: 1
        },
        highlight_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_highlight(req, res) {
    try {
      let highlight_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const updated_highlight_data = {
        title: req.body.title,
        icon: req.file?.filename
      };

      const updated_highlight = await highlights_schema.findByIdAndUpdate(highlight_id, updated_highlight_data, {
        new: true
      });

      if (!updated_highlight) {
        throw new Forbidden("Unable to update highlight");
      }
      return this.sendJSONResponse(
        res,
        "Updated Succesfully!",
        {
          length: 1
        },
        updated_highlight
      );
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  }

  async delete_hightlight(req, res) {
    try {
      const _id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const result = await highlights_schema.deleteOne({ _id: _id });

      if (!result) {
        throw new Forbidden("Highlight not Deleted ! Please Try again");
      }

      return this.sendJSONResponse(
        res,
        "Highlight Deleted Succesfully !",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};
