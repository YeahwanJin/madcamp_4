const mongoose = require("mongoose");
const fs = require("fs");
const { Category, Keyword } = require("./models/Keyword");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/keywordsDB";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// JSON 데이터 읽기
const rawData = fs.readFileSync("keywords.json");
const initialData = JSON.parse(rawData);

// 데이터 초기화 함수
async function initializeData() {
    try {
        await Category.deleteMany({});
        await Keyword.deleteMany({});

        for (const categoryName in initialData) {
            const category = new Category({ name: categoryName });
            await category.save();

            const keywords = initialData[categoryName].map(
                (keyword) => new Keyword({ keyword, category: category._id })
            );
            await Keyword.insertMany(keywords);
        }

        console.log("Database initialized with JSON data.");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initializeData();
module.exports = mongoose;
