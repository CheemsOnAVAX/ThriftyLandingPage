const Post = require("../../models/Post");
const Store = require("../../models/Store");
const User = require("../../models/user");

exports.getGroupPosts = async function (req, res) {
  const storeId = req.query.storeId;
  const currentUser = req.userAddress;
  let results;
  try {
    const foundStore = await Store.findOne({ _id: storeId });
    if (foundStore.type === "open") {
      results = await Post.find({ store: storeId })
        .sort({ createdAt: "desc" })
        .populate([
          {
            path: "author",
            select: ["name", "address", "bio", "avatar"],
          },
          {
            path: "store",
          },
        ]);
    } else {
      if (currentUser) {
        const foundUser = await User.findOne({ address: currentUser });
        const isMember = foundStore.members.some((memberId) =>
          memberId.equals(foundUser._id)
        );
        if (isMember) {
          results = await Post.find({ store: storeId })
            .sort({ createdAt: "desc" })
            .populate([
              {
                path: "author",
                select: ["name", "address", "bio", "avatar"],
              },
              {
                path: "store",
              },
            ]);
        } else {
          results = [];
        }
      } else {
        results = [];
      }
    }
    // Response
    res.send(results);
  } catch (err) {
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};
exports.postGroupPosts = async function (req, res) {
  const storeId = req.body.storeId;
  const postDetails = req.body.details;
  const currentUser = req.userAddress;
  try {
    const foundStore = await Store.findOne({ _id: storeId });
    const foundUser = await User.findOne({ address: currentUser });

    let isStoreOwner = currentUser === foundStore.owner;
    let isMember = foundStore.members.some((memberId) =>
      memberId.equals(foundUser._id)
    );
    if (!isStoreOwner && !isMember) {
      throw new Error("UnAuthorized Access!");
    }
    const newPost = new Post({
      title: "",
      details: postDetails,
      author: foundUser._id,
      store: storeId,
    });
    await newPost.save();
    const results = await Post.find({ store: storeId })
      .sort({ createdAt: "desc" })
      .populate([
        {
          path: "author",
          select: ["name", "address", "bio", "avatar"],
        },
        {
          path: "store",
        },
      ]);
    res.send(results);
  } catch (err) {
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};
exports.deleteGroupPosts = async function (req, res) {
  const postId = req.body.postId;
  const currentUser = req.userAddress;
  try {
    const foundUser = await User.findOne({ address: currentUser });
    const foundPost = await Post.findOne({ _id: postId });
    const foundStore = await Store.findOne({ _id: foundPost.store });

    let isStoreOwner = currentUser === foundStore.owner;
    let isOwner = foundPost.author.equals(foundUser._id);
    if (!isStoreOwner && !isOwner) {
      throw new Error("UnAuthorized Access!");
    }
    const result = await foundPost.remove();

    // Response
    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};
