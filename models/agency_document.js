const mongoose = require("mongoose");

const agencyDocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ["License", "Certificate", "Other"] // Example types
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true
    },
    issuedDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    documentUrl: {
      type: String,
      required: true
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AgencyDocument", agencyDocumentSchema);
