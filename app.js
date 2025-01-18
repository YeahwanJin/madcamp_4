require("dotenv").config(); // .env 파일 활성화
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const port = 3000; // 서버 포트 설정

// OpenAI API 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API Key 읽기
});

// 미들웨어 설정
app.use(express.json());
app.use(cors());

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
        // OpenAI 이미지 생성 API 호출
        const response = await openai.images.generate({
            prompt,
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

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
