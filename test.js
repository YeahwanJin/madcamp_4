const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API 키 읽기
});

(async () => {
    try {
        const models = await openai.models.list(); // 모델 목록 요청
        console.log(models);
    } catch (error) {
        console.error("Error:", error.message);
    }
})();
