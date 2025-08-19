const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const blog_content_syt_schema = new mongoose.Schema(
  {
    blog_title: {
      type: String,
      required: true
    },
    blog_title_points: {
      type: Array,
      required: true
    },
    blog_category: {
      type: String,
      required: true
    },
    blog_title_photo: {
      type: String,
      required: true
    },
    blog_content: {
      type: String,
      required: true
    },
    blogger_syt_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const blog_content_syt_model = mongoose.model("blog_content_syt", blog_content_syt_schema);

module.exports = blog_content_syt_model;
