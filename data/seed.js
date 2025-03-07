import mongoose from "mongoose";
import { DATABASE_URL } from "../env.js";
import { Blog } from "../models/Blog.js";
import { comment } from "../models/Comment.js"

mongoose.connect(DATABASE_URL)

await Blog.deleteMany({})
await Blog.insertMany(data)

await comment.deleteMany({})
await comment.insertMany(data)

mongoose.connection.close()

