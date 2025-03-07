import mongoose from "mongoose";

const Blogchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 15,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

export const Blog = mongoose.model("Blog", Blogchema)