import mongoose from 'mongoose';

const POST_CATEGORIES = [
  'Technology',
  'Programming',
  'Travel',
  'Lifestyle',
  'Education',
  'Food',
  'Photography',
  'Other',
];

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    image: {
      type: String, // filename stored in uploads/
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: POST_CATEGORIES,
        message: `Category must be one of: ${POST_CATEGORIES.join(', ')}`,
      },
      required: [true, 'Category is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for full-text search on title & content
postSchema.index({ title: 'text', content: 'text' });

export { POST_CATEGORIES };
const Post = mongoose.model('Post', postSchema);
export default Post;
