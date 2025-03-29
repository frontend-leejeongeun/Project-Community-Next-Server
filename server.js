require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Firebase 인증키 base64 -> JSON
const decodedKey = Buffer.from(process.env.FIREBASE_KEY, "base64").toString(
  "utf-8"
);
const serviceAccount = JSON.parse(decodedKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ✅ CORS 설정
const corsOptions = {
  origin: "https://project-community-next-client.vercel.app",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ 루트 확인용
app.get("/", (req, res) => {
  res.send("✅ 백엔드 서버 동작 중!");
});

// ✅ posts API
app.get("/api/posts", async (req, res) => {
  try {
    const postsRef = db.collection("posts").orderBy("createdAt", "desc");
    const snapshot = await postsRef.get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "posts 가져오기 실패" });
  }
});

// ✅ Q&A API
app.get("/api/qna", async (req, res) => {
  try {
    const snapshot = await db
      .collection("qna")
      .orderBy("createdAt", "desc")
      .get();
    const qna = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(qna);
  } catch (err) {
    res.status(500).json({ error: "qna 가져오기 실패" });
  }
});

app.get("/api/qna/:id", async (req, res) => {
  try {
    const doc = await db.collection("qna").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "문서 없음" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: "상세 가져오기 실패" });
  }
});

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
  } catch (err) {
    res.status(500).json({ error: "등록 실패" });
  }
});

app.put("/api/qna/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    await db.collection("qna").doc(req.params.id).update({ title, content });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "수정 실패" });
  }
});

app.delete("/api/qna/:id", async (req, res) => {
  try {
    await db.collection("qna").doc(req.params.id).delete();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "삭제 실패" });
  }
});

// 댓글
app.get("/api/qna/:id/comments", async (req, res) => {
  try {
    const snapshot = await db
      .collection("qna")
      .doc(req.params.id)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .get();
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "댓글 불러오기 실패" });
  }
});

app.get("/api/posts/:postId/comments/count", async (req, res) => {
  try {
    const postId = req.params.postId;
    const snapshot = await db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .get();
    const count = snapshot.size;
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: "댓글 개수 불러오기 실패" });
  }
});

app.post("/api/qna/:id/comments", async (req, res) => {
  try {
    const comment = req.body;
    await db
      .collection("qna")
      .doc(req.params.id)
      .collection("comments")
      .add(comment);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "댓글 등록 실패" });
  }
});

app.delete("/api/qna/:id/comments/:commentId", async (req, res) => {
  try {
    await db
      .collection("qna")
      .doc(req.params.id)
      .collection("comments")
      .doc(req.params.commentId)
      .delete();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "댓글 삭제 실패" });
  }
});

// ✅ 서버 실행
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
