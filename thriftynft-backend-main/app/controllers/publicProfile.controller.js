const User = require("../../models/user");
const PublicProfile = require("../../models/PublicProfile");
const { default: mongoose } = require("mongoose");

exports.getPublicProfileAll = async function (req, res) {
  try {
    let result = await PublicProfile.find().select("address");

    // Response
    res.send(result);
  } catch (err) {
    console.error("Getting Public Profile failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.getPublicProfile = async function (req, res) {
  const currentUser = req.userAddress;
  const authorId = req.query.authorId;
  try {
    const userId = authorId !== undefined ? authorId : currentUser;
    let result = await PublicProfile.findOne({
      address: userId,
    }).populate("user");

    // Response
    res.send(result);
  } catch (err) {
    console.error("Getting Public Profile failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.postPublicProfile = async function (req, res) {
  const currentUser = req.userAddress;
  const shopTitle = req.body.shopTitle;
  const shopDetails = req.body.shopDetails;
  const freelancerTitle = req.body.freelancerTitle;
  const freelancerDetails = req.body.freelancerDetails;
  const skills = req.body.skills;
  const languages = req.body.languages;
  const country = req.body.country;
  const portfolioLink = req.body.portfolioLink;
  const mainPurpose = req.body.mainPurpose;
  try {
    // Authorization
    const userData = await User.findOne({ address: currentUser });

    const newPublicProfile = new PublicProfile({
      address: currentUser,
      mainPurpose,
      shopTitle,
      shopDetails,
      freelancerTitle,
      freelancerDetails,
      skills,
      languages,
      country,
      portfolioLink,
      user: userData._id,
    });
    const result = await newPublicProfile.save();

    // Response
    res.send(result);
  } catch (err) {
    console.error("Creating Public Profile failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.putPublicProfile = async function (req, res) {
  const currentUser = req.userAddress;
  const shopTitle = req.body.shopTitle;
  const shopDetails = req.body.shopDetails;
  const freelancerTitle = req.body.freelancerTitle;
  const freelancerDetails = req.body.freelancerDetails;
  const skills = req.body.skills;
  const languages = req.body.languages;
  const country = req.body.country;
  const portfolioLink = req.body.portfolioLink;
  const mainPurpose = req.body.mainPurpose;
  try {
    // Authorization
    const foundProfile = await PublicProfile.findOne({
      address: currentUser,
    });
    foundProfile.shopTitle = shopTitle;
    foundProfile.shopDetails = shopDetails;
    foundProfile.freelancerDetails = freelancerDetails;
    foundProfile.freelancerTitle = freelancerTitle;
    foundProfile.skills = skills;
    foundProfile.languages = languages;
    foundProfile.country = country;
    foundProfile.portfolioLink = portfolioLink;
    foundProfile.mainPurpose = mainPurpose;
    const result = await foundProfile.save();

    // Response
    res.send(result);
  } catch (err) {
    console.error("Updating Public Profile failed!", err);
    res.status(500).send({ message: "Something went wrong!" });
  }
};
