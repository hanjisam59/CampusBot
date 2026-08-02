const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mergedName: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  mimeType: { type: String, required: true },
  knowledge: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
}, { timestamps: true });

module.exports = mongoose.model("Upload", uploadSchema);


