const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // Rich text content
    tags: [{ type: String }],
    categories: [{ type: String }],
    publishedAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Post", postSchema);
