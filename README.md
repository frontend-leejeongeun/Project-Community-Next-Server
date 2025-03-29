# Community Server (Express + Firebase)

## 프로젝트 소개

이 애플리케이션은 **Express**와 **Firebase Firestore**를 기반으로 구축된 커뮤니티 백엔드입니다.  
사용자는 자유게시판과 Q&A 기능을 통해 글을 작성하고 댓글을 주고받을 수 있으며, 모든 데이터는 Firestore에 저장됩니다.

## 사용 기술

- **Express**: 백엔드 서버 프레임워크
- **Firebase Admin SDK**: Firestore 데이터베이스와 연동
- **Firebase Firestore**: NoSQL 기반의 클라우드 데이터베이스
- **dotenv**: 환경변수 설정
- **cors**: CORS 정책 허용 미들웨어
- **ntp-client**: 서버 시간 동기화를 위한 모듈

## 핵심 기능

### 게시판 (Posts)

- `GET /api/posts`: 게시글 전체 조회
- `GET /api/posts/:postId/comments/count`: 게시글의 댓글 개수 조회

### Q&A

- `GET /api/qna`: Q&A 전체 목록 조회
- `GET /api/qna/:id`: 개별 질문 조회
- `POST /api/qna`: 질문 등록
- `PUT /api/qna/:id`: 질문 수정
- `DELETE /api/qna/:id`: 질문 삭제

### Q&A 댓글

- `GET /api/qna/:id/comments`: 댓글 목록 조회
- `POST /api/qna/:id/comments`: 댓글 등록
- `DELETE /api/qna/:id/comments/:commentId`: 댓글 삭제

## 프로젝트 구조

```plaintext
cafe-platform-backend
├── server.js                        # Express 서버 진입점
├── package.json                     # 프로젝트 설정
```

## 설치 및 실행 방법

1. 레포지토리를 클론합니다:

   ```bash
   git clone https://github.com/frontend-leejeongeun/Project-Community-Next-Server.git
   ```

2. 의존성을 설치합니다:

   ```bash
   npm install
   ```

3. 애플리케이션을 실행합니다:

   ```bash
   # 개발 모드 (nodemon)
   npm run dev

   # 프로덕션 실행
   npm start
   ```
