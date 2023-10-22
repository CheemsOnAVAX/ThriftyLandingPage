const Category = require("../../models/Category");
const User = require("../../models/user");

exports.getCategory = async (req, res) => {
  const page = Math.max(0, req.query.page || 1) - 1;
  const perPage = req.query.perPage || 10;
  let query = {};
  let sortQuery = {};
  try {
    const categoryCount = await Category.countDocuments({ ...query });
    const result = await Category.find({ ...query })
      .sort(sortQuery)
      .skip(perPage * page)
      .limit(perPage);
    res.send({
      data: result,
      perPage,
      page: page + 1,
      total: categoryCount,
      lastPage: Math.floor(categoryCount / perPage),
    });
  } catch (err) {
    console.error("Getting Category Failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.postCategory = async (req, res) => {
  const label = req.body.label;
  try {
    // Authorization
    const userData = await User.findOne({ address: req.userAddress });
    if (userData.accessLevel < 0) {
      throw new Error("Unauthorized Access!");
    }

    // Original Task
    const newCategory = new Category({ label });
    const result = await newCategory.save();

    // Response
    res.send(result);
  } catch (err) {
    console.error("Adding Category Failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.putCategory = async (req, res) => {
  const cId = req.body.cId;
  const isServiceCategory = req.body.isServiceCategory;
  try {
    // Authorization
    const userData = await User.findOne({ address: req.userAddress });
    if (userData.accessLevel < 0) {
      throw new Error("Unauthorized Access!");
    }

    // Original Task
    const resOne = await Category.findOne({ _id: cId });
    if (isServiceCategory !== undefined) {
      resOne.isServiceCategory = isServiceCategory;
    }
    const result = await resOne.save();

    // Response
    res.send(result);
  } catch (err) {
    console.error("Updating Category Failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.deleteCategory = async (req, res) => {
  const cId = req.body.cId;
  try {
    // Authorization
    const userData = await User.findOne({ address: req.userAddress });
    if (userData.accessLevel < 0) {
      throw new Error("Unauthorized Access!");
    }

    // Original Task
    const result = await Category.findOneAndDelete({ _id: cId });

    // Response
    res.send(result);
  } catch (err) {
    console.error("Remove Category Failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};
