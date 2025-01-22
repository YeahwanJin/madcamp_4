require("dotenv").config(); // .env 파일 활성화
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { translate } = require("googletrans");
const { Category, Keyword } = require("./models/Keyword");
const mongoose = require("mongoose");
const initializeSocket = require("./socket");
const http = require("http");

const app = express();
const port = 3000; // 서버 포트 설정

// OpenAI API 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API Key 읽기
});

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/keywordsDB";
mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to mongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// 미들웨어 설정
app.use(express.json());
app.use(cors());

// 번역 함수
async function translateToEnglish(text) {
    try {
        const result = await translate(text, { to: "en" });
        return result.text; // 번역된 텍스트 반환
    } catch (error) {
        console.error("Translation error:", error);
        throw new Error("Failed to translate text");
    }ㅠ
}

// 기본 엔드포인트
app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// 이미지 생성 엔드포인트
app.post("/generate-image", async (req, res) => {
    const { prompt, n = 1, size = "1024x1024" } = req.body;

    // 입력 검증
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // 한글 프롬프트를 영어로 번역
        const translatedPrompt = await translateToEnglish(prompt);

        // OpenAI 이미지 생성 API 호출
        const response = await openai.images.generate({
            prompt: translatedPrompt,
            n: Math.min(Number(n), 5), // 최대 5개 이미지 제한
            size: ["256x256", "512x512", "1024x1024"].includes(size) ? size : "1024x1024",
        });

        // 생성된 이미지 URL 반환
        const imageUrls = response.data.map((item) => item.url);
        res.json({ imageUrls });
    } catch (error) {
        // 에러 처리
        console.error("Error generating image:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.error?.message || "Failed to generate image" });
    }
});

app.post("/keyword", async (req, res) => {
    const { category } = req.body;

    if (!category) {
        return res.status(400).json({ error: "카테고리가 필요합니다." });
    }

    try {
        const categoryDoc = await Category.findOne({ name: category });

        if (!categoryDoc) {
            return res.status(400).json({ error: "카테고리를 찾을 수 없습니다." });
        }

        const keywords = await Keyword.find({ category: categoryDoc._id });

        if (keywords.length === 0) {
            return res.status(404).json({ error: "카테고리에 키워드가 없습니다." });
        }

        // 랜덤 키워드 선택
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        res.json({ keyword: randomKeyword.keyword, category: categoryDoc.name });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "서버 오류" });
    }
});


const server = http.createServer(app);
initializeSocket(server);

// 서버 시작
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
