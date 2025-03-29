require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 8080;

// 🔐 환경변수로부터 Firebase 키를 base64로 읽고 파싱
const decodedKey = Buffer.from(process.env.FIREBASE_KEY, "base64").toString(
  "utf-8"
);
const serviceAccount = JSON.parse(decodedKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// ✅ 여기에 기존 API 라우트 다 그대로 붙이면 돼

// 간단한 루트 라우터
app.get("/", (req, res) => {
  res.send("🚀 Firebase 백엔드 서버 실행 중!");
});

// ✅ 서버 시작
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
