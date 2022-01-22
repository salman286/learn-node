const _ = require("lodash");
const { blogPrivateFields } = require("../config/constants");
const ApiFeatures = require("../lib/apiFeatures");
const AppError = require("../lib/appError");
const catchAsync = require("../lib/catchAsync");
const Blog = require("../models/blog");

exports.getBlogs = catchAsync(async (req, res) => {
  const queryObj = req.query;
  let query = Blog.find({});

  // filter by title
  if (queryObj.title) {
    const titleEx = new RegExp(queryObj.title, "i");
    query = query.find({ title: titleEx });
  }

  // pagination
  const features = new ApiFeatures(query, req.query).sort().paginate();

  const blogs = await features.query;
  const totalBlogs = await Blog.count({});

  res.status(200).json({
    status: "success",
    results: blogs.length,
    total: totalBlogs,
    data: blogs,
  });
});

exports.getBlog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new AppError("Blog with this id does not exist!", 404));
  }

  res.status(200).json({ status: "success", data: blog });
});

exports.createBlog = catchAsync(async (req, res) => {
  const { title, content, tags } = req.body;

  const blog = await Blog.create({
    title,
    content,
    tags,
    createdBy: req.user.id,
  });
  res.status(201).json({ status: "success", data: blog });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new AppError("Blog with this id does not exist!", 404));
  }

  if (blog.createdBy.id === req.user.id || req.user.role === "admin") {
    await Blog.findByIdAndDelete(id);
  } else {
    return next(
      new AppError("You do not have rights to delete this blog.", 401)
    );
  }
  res.status(204).json({ status: "success", data: null });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new AppError("Blog with this id does not exist!", 404));
  }

  if (blog.createdBy.id === req.user.id) {
    const updateBlogProps = _.omit(req.body, blogPrivateFields);
    updateBlogProps.updatedAt = new Date().toISOString();
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateBlogProps, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({ status: "success", data: updatedBlog });
  } else {
    return next(new AppError("You do not have rights to edit this blog.", 401));
  }
});
