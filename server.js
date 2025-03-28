require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 Firebase Admin SDK 초기화 (절대 경로 사용)
const serviceAccountPath = path.join(
  __dirname,
  process.env.FIREBASE_CREDENTIALS
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Firebase 서비스 계정 키 파일이 없습니다.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// ✅ posts API
app.get("/api/posts", async (req, res) => {
  try {
    const postsRef = db.collection("posts").orderBy("createdAt", "desc");
    const snapshot = await postsRef.get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (error) {
    console.error("🔥 Firestore 데이터 가져오기 실패:", error);
    res.status(500).json({ error: "서버 에러" });
  }
});

app.get("/api/posts/:postId/comments/count", async (req, res) => {
  const { postId } = req.params;
  try {
    const commentsRef = db
      .collection("posts")
      .doc(postId)
      .collection("comments");
    const snapshot = await commentsRef.get();
    const count = snapshot.size;
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ 댓글 개수 가져오기 실패:", error);
    res.status(500).json({ error: "댓글 개수 조회 중 오류 발생" });
  }
});

// ✅ Q&A API

// Q&A 전체 질문 조회
app.get("/api/qna", async (req, res) => {
  try {
    const snapshot = await db
      .collection("qna")
      .orderBy("createdAt", "desc")
      .get();
    const qna = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(qna);
  } catch (error) {
    console.error("🔥 Q&A 목록 가져오기 실패:", error);
    res.status(500).json({ error: "Q&A 목록 조회 실패" });
  }
});

// Q&A 개별 질문 조회
app.get("/api/qna/:id", async (req, res) => {
  try {
    const doc = await db.collection("qna").doc(req.params.id).get();
    if (!doc.exists)
      return res.status(404).json({ error: "문서를 찾을 수 없음" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("🔥 Q&A 상세 조회 실패:", error);
    res.status(500).json({ error: "Q&A 조회 실패" });
  }
});

// Q&A 질문 등록
app.post("/api/qna", async (req, res) => {
  try {
    const { title, content, authorEmail, authorId } = req.body;
    const docRef = await db.collection("qna").add({
      title,
      content,
      authorEmail,
      authorId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error("🔥 Q&A 등록 실패:", error);
    res.status(500).json({ error: "Q&A 등록 실패" });
  }
});

// Q&A 질문 수정
app.put("/api/qna/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    await db.collection("qna").doc(req.params.id).update({ title, content });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Q&A 수정 실패:", error);
    res.status(500).json({ error: "Q&A 수정 실패" });
  }
});

// Q&A 질문 삭제
app.delete("/api/qna/:id", async (req, res) => {
  try {
    await db.collection("qna").doc(req.params.id).delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Q&A 삭제 실패:", error);
    res.status(500).json({ error: "Q&A 삭제 실패" });
  }
});

// Q&A 댓글 목록
app.get("/api/qna/:id/comments", async (req, res) => {
  try {
    const commentsRef = db
      .collection("qna")
      .doc(req.params.id)
      .collection("comments")
      .orderBy("createdAt", "asc");
    const snapshot = await commentsRef.get();
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(comments);
  } catch (error) {
    console.error("🔥 댓글 조회 실패:", error);
    res.status(500).json({ error: "댓글 조회 실패" });
  }
});

// Q&A 댓글 등록
app.post("/api/qna/:id/comments", async (req, res) => {
  try {
    const comment = req.body;
    await db
      .collection("qna")
      .doc(req.params.id)
      .collection("comments")
      .add(comment);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("🔥 댓글 등록 실패:", error);
    res.status(500).json({ error: "댓글 등록 실패" });
  }
});

// Q&A 댓글 삭제
app.delete("/api/qna/:id/comments/:commentId", async (req, res) => {
  try {
    await db
      .collection("qna")
      .doc(req.params.id)
      .collection("comments")
      .doc(req.params.commentId)
      .delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 댓글 삭제 실패:", error);
    res.status(500).json({ error: "댓글 삭제 실패" });
  }
});

// 🔥 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버 실행: http://localhost:${PORT}`);
});
