import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',  // 'Blog' 모델을 참조
        required: true
    }
});

export const Comment = mongoose.model('Comment', commentSchema);
