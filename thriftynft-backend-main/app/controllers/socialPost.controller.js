const SocialPost = require('../../models/SocialPost');
const SocialComment = require('../../models/SocialComment');
const Follower = require('../../models/Follower');
const User = require('../../models/user');

exports.addSocialPost = async (req, res) => {
  const user = req.user;
  const { content, images, ipfsLink, isPublicComment, title, tags, videos } =
    req.body;
  try {
    let post = new SocialPost({
      createdBy: user._id,
      content,
      images,
      ipfsLink,
      isPublicComment,
      title,
      tags,
      videos,
    });
    await post.save();
    post.likes = [];
    res.status(200).send(post);
  } catch (error) {
    console.log(error, 'addSocialPost');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.addSocialPostLike = async (req, res) => {
  const user = req.user;
  const { socialPostId } = req.body;
  try {
    let post = await SocialPost.findById(socialPostId).populate(
      'createdBy',
      'name userRealName avatar address'
    );
    if (!post) {
      return res.status(404).send({
        message: 'SocialPost not found with id ' + socialPostId,
      });
    }
    const isLiked = post?.likes?.includes(user._id);
    if (isLiked) {
      post.likes.pull(user._id);
    } else {
      post.likes.push(user._id);
    }
    post.likesCount = post?.likes?.length;
    const _isLiked = post?.likes?.includes(user._id);

    await post.save();
    //asign isLiked to post
    const _post = post.toObject();
    _post.isLiked = _isLiked;
    _post.likes = [];

    res.status(200).send(_post);
  } catch (error) {
    console.log(error, 'addSocialPostLike');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.addSocialComment = async (req, res) => {
  const user = req.user;
  const { content, ipfsLink, parentId, postId } = req.body;
  try {
    if (parentId) {
      let parentSocialComment = await SocialComment.findById(parentId);
      if (!parentSocialComment) {
        return res.status(404).send({
          message: 'SocialComment not found with id ' + parentId,
        });
      }
      parentSocialComment.hasChildren = true;
      await parentSocialComment.save();
    }
    let comment = new SocialComment({
      createdBy: user._id,
      content,
      ipfsLink,
      parentId,
      postId,
    });

    await comment.save();
    //populate createdBy from comment
    await comment.populate('createdBy', 'name userRealName avatar address');
    let post = await SocialPost.findById(postId);
    post.commentsCount = post.commentsCount + 1;

    await post.save();
    comment.likes = [];
    res.status(200).send(comment);
  } catch (error) {
    console.log(error, 'addSocialComment');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.addSocialCommentLike = async (req, res) => {
  const user = req.user;
  const { SocialCommentId } = req.body;
  try {
    let comment = await SocialComment.findById(SocialCommentId).populate(
      'createdBy',
      'name userRealName avatar address'
    );
    if (!comment) {
      return res.status(404).send({
        message: 'SocialComment not found with id ' + SocialCommentId,
      });
    }
    const isLiked = comment?.likes?.includes(user._id);
    if (isLiked) {
      comment.likes.pull(user._id);
    } else {
      comment.likes.push(user._id);
    }
    comment.likesCount = comment.likes.length;
    const _isLiked = comment?.likes?.includes(user._id);
    await comment.save();
    let _comment = comment.toObject();
    _comment.isLiked = _isLiked;
    _comment.likes = [];
    res.status(200).send(_comment);
  } catch (error) {
    console.log(error, 'addSocialCommentLike');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.getSocialPosts = async (req, res) => {
  const page = req.query.page || 1; // Get the page number from query parameters
  const limit = req.query.limit || 10; // Define the page size (number of comments per page)
  const skip = (page - 1) * limit;
  try {
    let SocialPosts = await SocialPost.find({})
      .populate('createdBy', 'name userRealName avatar address')
      .select('-likes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    SocialPosts = SocialPosts.map((post) => {
      const isLiked = post?.likes?.includes(req.user._id);
      //remove likes from post
      post.likes = [];
      return Object.assign({}, post.toObject(), {
        isLiked,
      });
    });
    const total = await SocialPost.countDocuments({});
    res.status(200).send({
      posts: SocialPosts,
      currentPage: page,
      total: total,
    });
  } catch (error) {
    console.log(error, 'getSocialPosts');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.getMySocialPosts = async (req, res) => {
  const user = req.user;
  const page = req.query.page || 1; // Get the page number from query parameters
  const limit = req.query.limit || 10; // Define the page size (number of comments per page)
  const skip = (page - 1) * limit;
  try {
    const SocialPosts = await SocialPost.find({ createdBy: user._id })
      .populate('createdBy', 'name userRealName avatar address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const modifiedPosts = SocialPosts.map((post) => {
      const isLiked = post?.likes?.includes(user._id);
      //remove likes from post
      post.likes = [];
      return Object.assign({}, post.toObject(), {
        isLiked,
      });
    });
    const total = await SocialPost.countDocuments({ createdBy: user._id });
    res.status(200).send({
      posts: modifiedPosts,
      currentPage: page,
      total: total,
    });
  } catch (error) {
    console.log(error, 'getMySocialPosts');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.getSocialAllComments = async (req, res) => {
  const user = req.user;
  try {
    const page = req.query.page || 1; // Get the page number from query parameters
    const pageSize = req.query.limit || 10; // Define the page size (number of comments per page)
    const skip = (page - 1) * pageSize; // Calculate the number of comments to skip
    const postId = req.query.postId;
    const parentId = req.query.parentId || null;

    // Fetch the latest parent comments with pagination
    let latestComments = await SocialComment.find({
      postId,
      parentId,
    })
      .populate('createdBy', 'name userRealName avatar address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Fetch total count of comments matching the query
    const total = await SocialComment.countDocuments({
      postId,
      parentId,
    });

    // Fetch replies for parent comments with 'hasChildren' set to true
    for (let i = 0; i < latestComments.length; i++) {
      const parentComment = latestComments[i];
      if (parentComment.hasChildren) {
        let reply = await SocialComment.find({
          parentId: parentComment._id,
        })
          .populate('createdBy', 'name userRealName avatar address')
          .sort({ createdAt: -1 })
          .limit(5); // Limit the number of replies to 5
        const totalReply = await SocialComment.countDocuments({
          parentId: parentComment._id,
        });
        reply = reply.map((comment) => {
          const isLiked = comment?.likes?.includes(user._id);
          comment.likes = [];
          return Object.assign({}, comment.toObject(), {
            isLiked,
          });
        });

        latestComments[i] = Object.assign({}, latestComments[i].toObject(), {
          reply,
          totalReply,
        });
      }
    }

    latestComments = latestComments.map((comment) => {
      const isLiked = comment?.likes?.includes(user._id);
      comment.likes = [];
      let _comment;
      try {
        _comment = comment.toObject();
      } catch (error) {
        _comment = comment;
      }
      return Object.assign({}, _comment, {
        isLiked,
      });
    });

    res.status(200).json({
      comments: latestComments,
      total,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSocialComments = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1; // Get the page number from query parameters
    const pageSize = req.query.limit || 10; // Define the page size (number of comments per page)
    const skip = (page - 1) * pageSize; // Calculate the number of comments to skip
    const parentId = req.query.parentId || null;
    const postId = req.query.postId;

    let latestComments = await SocialComment.find({
      parentId,
    })
      .populate('createdBy', 'name userRealName avatar address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await SocialComment.countDocuments({
      parentId,
      postId,
    });

    for (let i = 0; i < latestComments.length; i++) {
      const parentComment = latestComments[i];
      if (parentComment.hasChildren) {
        let reply = await SocialComment.find({
          parentId: parentComment._id,
        })
          .populate('createdBy', 'name userRealName avatar address')
          .sort({ createdAt: -1 })
          .limit(5); // Limit the number of replies to 5
        const totalReply = await SocialComment.countDocuments({
          parentId: parentComment._id,
        });
        reply = reply.map((comment) => {
          const isLiked = comment?.likes?.includes(user._id);
          comment.likes = [];
          return Object.assign({}, comment.toObject(), {
            isLiked,
          });
        });

        latestComments[i] = Object.assign({}, latestComments[i].toObject(), {
          reply,
          totalReply,
        });
      }
    }

    latestComments = latestComments.map((comment) => {
      const isLiked = comment?.likes?.includes(user._id);
      comment.likes = [];
      let _comment;
      try {
        _comment = comment.toObject();
      } catch (error) {
        _comment = comment;
      }
      return Object.assign({}, _comment, {
        isLiked,
      });
    });

    res.status(200).json({
      comments: latestComments,
      total: total,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteMySocialPost = async (req, res) => {
  const user = req.user;
  const { socialPostId } = req.body;
  try {
    let post = await SocialPost.findById(socialPostId);
    if (!post) {
      return res.status(404).send({
        message: 'SocialPost not found with id ' + socialPostId,
      });
    }
    if (post.createdBy.toString() !== user._id.toString()) {
      return res.status(401).send({
        message: 'You are not authorized to delete this post',
      });
    }
    await post.remove();
    res.status(200).send({
      message: 'SocialPost deleted successfully',
    });
  } catch (error) {
    console.log(error, 'deleteMySocialPost');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

exports.getNewsFeedPost = async (req, res) => {
  const user = req.user;
  const userIdOrName = req.query.userIdOrName;
  const userPost = req.query.userPost;
  try {
    const page = Number(req.query.page || 1); // Get the page number from query parameters
    const limit = Number(req.query.limit || 10); // Define the page size (number of posts per page)
    const skip = (page - 1) * limit;

    if (userPost === 'true') {
      let socialPost = await SocialPost.find({
        createdBy: user._id,
      })
        .populate('createdBy', 'name userRealName avatar address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SocialPost.countDocuments({
        createdBy: user._id,
      });

      socialPost = socialPost.map((post) => {
        const isLiked = post?.likes?.includes(user._id);
        post.likes = [];
        return Object.assign({}, post.toObject(), {
          isLiked,
        });
      });
      return res.status(200).send({
        posts: socialPost,
        currentPage: page,
        total: total,
      });
    }

    if (userIdOrName) {
      let user;

      user = await User.findOne({ name: userIdOrName });
      if (!user) {
        try {
          user = await User.findOne({ _id: userIdOrName });
        } catch (error) {}
      }
      if (!user) {
        return res.status(404).send({
          message: 'User not found with id ' + userIdOrName,
        });
      }
      let socialPost = await SocialPost.find({
        createdBy: user._id,
      })
        .populate('createdBy', 'name userRealName avatar address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SocialPost.countDocuments({
        createdBy: user._id,
      });

      socialPost = socialPost.map((post) => {
        const isLiked = post?.likes?.includes(user?._id || '');
        post.likes = [];
        return Object.assign({}, post.toObject(), {
          isLiked,
        });
      });
      return res.status(200).send({
        posts: socialPost,
        currentPage: page,
        total: total,
      });
    }
    if (user?.address) {
      const follower = await Follower.findOne({ userId: user._id });
      const friendList = follower?.friendList || [];
      const totalFriendPosts = await SocialPost.countDocuments({
        createdBy: { $in: friendList },
      });

      let socialPosts = [];

      if (totalFriendPosts > 0) {
        let friendPost = await SocialPost.find({
          createdBy: { $in: friendList },
        })
          .populate('createdBy', 'name userRealName avatar address')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        friendPost = friendPost.map((post) => {
          const isLiked = post?.likes?.includes(user._id);
          post.likes = [];
          return Object.assign({}, post.toObject(), {
            isLiked,
          });
        });
        socialPosts = friendPost;

        if (socialPosts.length < limit) {
          // Fetch public posts if friend posts are not enough
          const publicPostLimit = limit - socialPosts.length;
          let publicPost = await SocialPost.find({
            createdBy: { $nin: friendList, $ne: user._id },
          })
            .populate('createdBy', 'name userRealName avatar address')
            .sort({ createdAt: -1 })
            .skip(0)
            .limit(publicPostLimit);
          publicPost = publicPost.map((post) => {
            const isLiked = post?.likes?.includes(user._id);
            post.likes = [];
            return Object.assign({}, post.toObject(), {
              isLiked,
            });
          });
          socialPosts = [...socialPosts, ...publicPost];
        }
      } else {
        // Fetch public posts if no friend posts
        let publicPost = await SocialPost.find({
          createdBy: { $nin: friendList },
        })
          .populate('createdBy', 'name userRealName avatar address')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        publicPost = publicPost.map((post) => {
          const isLiked = post?.likes?.includes(user._id);
          post.likes = [];
          return Object.assign({}, post.toObject(), {
            isLiked,
          });
        });

        socialPosts = publicPost;
      }

      const totalPublicPosts = await SocialPost.countDocuments({
        createdBy: { $nin: friendList },
      });

      return res.status(200).send({
        posts: socialPosts,
        currentPage: page,
        total: totalFriendPosts + totalPublicPosts,
      });
    } else {
      // Handle the case where user doesn't have an address (public posts only)
      const publicPost = await SocialPost.find()
        .populate('createdBy', 'name userRealName avatar address')
        .sort({ createdAt: -1 })
        .select('-likes')
        .skip(skip)
        .limit(limit);

      const totalPublicPosts = await SocialPost.countDocuments();

      return res.status(200).send({
        posts: publicPost,
        currentPage: page,
        total: totalPublicPosts,
      });
    }
  } catch (error) {
    console.error(error, 'getNewsFeedPost');
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};
