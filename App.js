import express from 'express'
import mongoose from 'mongoose'
import { DATABASE_URL } from './env.js'
import { Blog } from './models/Blog.js'
import { Comment } from './models/Comment.js'

/* 예외 설정 */
const asyncHandler = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res)
        } catch (e) {
            switch (e.name) {
                case 'ValidationError':
                    res.status(400).send({ message: e.message })
                    break
                case 'CastError':
                    res.status(404).send({ message: "ID를 찾을 수 없습니다" })
                    break
                default:
                    res.status(500).send({ message: e.message })
                    break
            }
        }
    }
}

const App = express() //서버 객체 생성
App.use(express.json()) // 미들웨어 express.json 헤더의 컨텐츠 타입이 application/json 이면 body를 파싱해주는 미들웨어

/* ----------- */
/* Blogs APi */
/* 블로그 포스트 추가 */
App.post("/blogs", asyncHandler(async (req, res) => {
    const { title, content, author } = req.body;

    // 필수 필드가 누락된 경우
    if (!title || !content || !author) {
        return res.status(400);
    }

    try {
        // 블로그 포스트 생성
        const blog = await Blog.create(req.body);
        res.status(201).send(blog);
    } catch (error) {
        // 오류 처리
        console.error(error); // 서버 로그에 오류 출력
        res.status(500).send({ message: error.message });
    }
}));

/* 블로그 글 전체 조회 */
App.get('/blogs', asyncHandler(async (req, res) => {
    const sort = req.query.sort
    const count = Number(req.query.count) || 0
    const sortOption = {
        createdAt: sort === "oldest" ? 'asc' : 'desc'
    }
    const blogs = await Blog.find().sort(sortOption).limit(count)
    res.send(blogs)
}))

/* 특정 블로그 글 조회 */
App.get("/blogs/:id", asyncHandler(async (req, res) => {
    const id = req.params.id
    const blog = await Blog.findById(id)
    if (!blog) {
        res.status(404)
    }
    res.send(blog)
}))

/* 특정 블로그 글 수정 */
App.patch("/blogs/:id", asyncHandler(async (req, res) => {
    const blogId = req.params.id; // URL에서 블로그 ID 추출
    const { title, content } = req.body;

    // 클라이언트가 `author`를 수정하려는 경우 예외 처리
    if (req.body.author) {
        return res.status(400).send({ message: "author는 변경할 수 없습니다." });
    }

    // 블로그 포스트 찾기
    const blog = await Blog.findById(blogId);

    // `title`과 `content`만 수정 가능
    if (title) blog.title = title;
    if (content) blog.content = content;

    // 수정된 블로그 저장
    await blog.save();

    res.status(200).send(blog);
}));

/* 특정 블로그 글 삭제 */
App.delete('/blogs/:id', asyncHandler(async (req, res) => {
    const id = req.params.id
    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) {
        return res.status(404).send({ message: '해당 ID가 존재하지 않습니다' })
    }
    res.sendStatus(204)
}))



/* Comment APi */
/* 블로그에 댓글 작성 */
App.post("/comments", asyncHandler(async (req, res) => {
    const { content, author, blogId } = req.body;

    // 필수 필드가 누락된 경우
    if (!content || !author || !blogId) {
        return res.status(400);
    }

    // Comment 생성
    const comment = await Comment.create(req.body);

    // 생성된 댓글 반환
    res.status(201).send(comment);
}));

/* 특정 블로그의 댓글 조회 */
App.get("/comments/:id", asyncHandler(async (req, res) => {
    const id = req.params.id
    const comment = await Comment.findById(id)
    if (!comment) {
        res.status(404)
    }
    res.send(comment)
}))

/* 특정 댓글 수정 */
App.patch('/comments/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    let comment = await Comment.findById(id);

    if (!comment) {
        return res.status(404)
    }

    if (req.body.blogId) {
        return res.status(400)
    }

    // 댓글에 수정할 필드 적용
    Object.keys(req.body).forEach((key) => {
        if (key !== 'blogId') { // blogId는 수정할 수 없으므로 제외
            comment[key] = req.body[key];
        }
    });

    // 수정된 댓글 저장
    await comment.save();

    // 수정된 댓글 반환
    res.status(200).send(comment);
}));

/* 특정 댓글 삭제 */
App.delete('/comments/:id', asyncHandler(async (req, res) => {
    const id = req.params.id
    const comment = await Comment.findByIdAndDelete(id)
    if (!comment) {
        return res.status(404)
    }
    res.sendStatus(204)
}))
/* ---------- */
mongoose.connect(DATABASE_URL)
    .then(() => console.log('DB 연결이 완료되었습니다.'))

App.listen(3000, () => {
    console.log("서버가 동작 중입니다.")
})
//listen 서버를 유지하는 함수 
// 3000: 3000번째 포트에서 대기 
