const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

const keywordSchema = new mongoose.Schema({
    keyword: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
});

const Category = mongoose.model("Category", categorySchema);
const Keyword = mongoose.model("Keyword", keywordSchema);

module.exports = { Category, Keyword };