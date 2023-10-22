const Putonsale = require('../../models/PutOnSaleList');
const Item = require('../../models/item');
const Auction = require('../../models/AuctionList');
const User = require('../../models/user');
const Store = require('../../models/Store');
const { BigNumber } = require('ethers');
const _ = require('lodash');

// Retrieve all Customers from the database.
exports.getPutonsale = async (req, res) => {
  const collectionId = req.query.collectionId;
  const tokenId = req.query.tokenId;
  const maker = req.query.maker;
  const chainId = req.query.chainId;
  try {
    const result = await Putonsale.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      maker: maker,
      chainId: chainId,
      isCancel: false,
      isClaim: false,
      isAlive: true,
    });
    const fav = await Item.find({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
    });
    res.send({ list: result, itemInfo: fav });
  } catch (err) {
    //console.log('=something went wrong ', e);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.getPutonsaleAll = async (req, res) => {
  try {
    const result = await Putonsale.find({
      isCancel: false,
      isClaim: false,
      isAlive: true,
    });
    res.send(result);
  } catch (err) {
    //console.log('=something went wrong ', e);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.getPutonsaleByMaker = async (req, res) => {
  const maker = req.query.maker;
  //console.log(maker);
  try {
    const result = await Putonsale.find({ maker: maker });
    //console.log(result);
    const itemInfo = [];
    await Promise.all(
      _.map(result, async (item) => {
        const fav = await Item.findOne({
          collectionId: item?.collectionId,
          tokenId: item?.tokenId,
          chainId: item?.chainId,
          isCancel: false,
          isClaim: false,
          isAlive: true,
        });
        itemInfo.push({
          category: fav?.category,
          metadata: fav?.metadata,
          likes: fav?.likes,
          mode: fav?.mode,
        });
      })
    );

    res.send({ list: result, itemInfo: itemInfo });
  } catch (err) {
    console.log('=something went wrong ', err);
    res.status(500).send({
      message: err || 'Something went wrong!',
    });
  }
};

exports.getPutonsalePageNum = async (req, res) => {
  const pageNum = Math.max(0, req.query.page);
  const perPage = req.query.perPage || 10;
  const limitNFT = req.query.limit || 0;
  const source = req.query.source;
  const status = req.query.status;
  const tag = req.query.tag;
  const category = req.query.category;
  const nftType = req.query.nftType;
  const nftMode = req.query.nftMode;
  const volume = req.query.volume;
  const price = req.query.price;
  const listing = req.query.listing;
  const sortBy = req.query.sortBy;

  let query = {
    isShadowListed: false,
  };
  let sortQuery = {};

  // Sorting
  if (sortBy === 'featured') {
    query.featurePriority = { $gt: 0 };
    sortQuery.featurePriority = -1;
  }
  if (sortBy === 'top') {
    query.amountSold = { $gt: 0 };
    sortQuery.amountSold = -1;
  }

  // Filtering
  if (
    typeof category !== 'undefined' &&
    category !== 'All' &&
    category !== ''
  ) {
    query = {
      ...query,
      category: category,
    };
  }
  if (typeof tag !== 'undefined' && tag !== 'All' && tag !== '') {
    query = {
      ...query,
      tag: tag,
    };
  }
  //console.log('===getPutonsalePageNum===', req.query);
  try {
    // const itmCnt = await Putonsale.count({ isAlive: { $ne: false } });
    // const result = await Putonsale.find({isAlive: { $ne: false }, ...query}).limit(perPage).skip(perPage * pageNum)

    let result = await Putonsale.find({
      isAlive: { $ne: false },
      isCancel: false,
      isClaim: false,
      ...query,
    })
      .sort(sortQuery)
      .limit(limitNFT);

    // //console.log("**************itmCnt***", itmCnt)
    const relationInfo = [];
    for (let i = 0; i < result.length; i++) {
      // //console.log("*****************result[i]", result[i])
      const user = await User.findOne({ address: result[i].maker }).select([
        'name',
        'avatar',
        'address',
      ]);
      // //console.log("===user",user)
      const item = await Item.findOne({
        collectionId: result[i].collectionId,
        tokenId: result[i].tokenId,
      });
      // //console.log("------------",item)
      relationInfo.push({
        username: user.name,
        avatar: user.avatar,
        address: user.address,
        collectionLikes: item?.likes,
        metadata: item?.metadata,
        mode: item?.mode,
        key: result[i].key,
        maker: result[i].maker,
        chainId: result[i].chainId,
        tokenId: result[i].tokenId,
        amount: result[i].amount,
        amountInitial: result[i].amountInitial,
        amountSold: result[i].amountSold,
        royaltyFee: result[i].royaltyFee,
        admin: result[i].admin,
        coinType: result[i].coinType,
        expDate: result[i].expDate,
        price: result[i].price,
        endPrice: result[i].endPrice,
        isFNFT: result[i].isFNFT,
        _type: result[i]._type,
        saleMode: result[i].saleMode,
        category: result[i].category,
        isAlive: result[i].isAlive,
        collectionId: result[i].collectionId,
        featurePriority: result[i].featurePriority,
      });
    }
    let filerResult = relationInfo;
    if (typeof nftMode !== 'undefined' && nftMode !== 'all' && nftMode !== '') {
      filerResult = filerResult.filter((el) => el.mode === Number(nftMode));
    }
    if (typeof nftType !== 'undefined' && nftType !== 'all' && nftType !== '') {
      filerResult = filerResult.filter(
        (el) => el.fnft_Type === Number(nftType)
      );
    }

    const itmCnt_1 = filerResult.length;
    filerResult = filerResult.slice(pageNum * perPage, (pageNum + 1) * perPage);
    res.send({
      data: filerResult,
      total: itmCnt_1,
      current_page: pageNum,
      first_page_url: '',
      from: 0,
      last_page: Math.floor(itmCnt_1 / perPage),
      last_page_url: '',
      links: [],
      path: '',
      per_page: perPage,
      to: 0,
    });
  } catch (err) {
    console.error('Create user fail', err);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.addPutonsale = async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const key = req.body.key;
  const collectionId = req.body.collectionId;
  const maker = req.body.maker;
  const chainId = req.body.chainId;
  const tokenId = req.body.tokenId;
  const royaltyFee = req.body.royaltyFee;
  const admin = req.body.admin;
  const price = req.body.price;
  const endPrice = req.body.endPrice;
  const coinType = req.body.coinType;
  const expDate = req.body.expDate;
  const isFNFT = req.body.isFNFT;
  const _type = req.body._type;
  const royaltyShare = req.body.royaltyShare;
  const saleMode = req.body.saleMode;
  const category = req.body.category;
  const metadata = req.body.metadata;
  const tags = req.body.tags;
  const amount = req.body.amount;
  let amountInitial = req.body.amount;

  try {
    const resOne = await Putonsale.findOne({
      $or: [
        { collectionId: collectionId, tokenId: tokenId, maker: maker },
        { key: key },
      ],
    });
    if (resOne && resOne.amountInitial) {
      amountInitial = resOne.amountInitial;
    }

    const result = await Putonsale.findOneAndUpdate(
      {
        $or: [
          { collectionId: collectionId, tokenId: tokenId, maker: maker },
          { key: key },
        ],
      },
      {
        name,
        description,
        collectionId: collectionId,
        chainId: chainId,
        key: key,
        amount: amount,
        amountInitial: amountInitial,
        tokenId: tokenId,
        royaltyFee: royaltyFee,
        royaltyShare: royaltyShare,
        admin: admin,
        price: price,
        endPrice: endPrice,
        coinType: coinType,
        expDate: expDate,
        _type: _type,
        isFNFT: isFNFT,
        saleMode: saleMode,
        maker: maker,
        category: category,
        isAlive: true,
        isCancel: false,
        isClaim: false,
        tags: tags,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Item.findOneAndUpdate(
      { collectionId: collectionId, chainId: chainId, tokenId: tokenId },
      {
        collectionId: collectionId,
        chainId: chainId,
        tokenId: tokenId,
        category: category,
        metadata: metadata,
        _type: _type,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error('Create user fail', err);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.cancelList = async (req, res) => {
  const key = req.body.key;
  const flag = req.body.flag;

  console.log('cancel======>', key, flag);

  try {
    if (flag == 0) {
      const resOne = await Putonsale.findOne({ key: key });
      resOne.isAlive = false;
      const result = await resOne.save();
      res.send(result);
    }
    if (flag == 1) {
      const resOne = await Putonsale.findOne({ key: key });
      resOne.isAlive = false;
      resOne.isCancel = true;
      const result = await resOne.save();
      res.send(result);
    }
    if (flag == 2) {
      const resOne = await Putonsale.findOne({ key: key });
      resOne.isClaim = false;
      resOne.isCancel = true;
      const result = await resOne.save();
      res.send(result);
    }
    // const result = await Putonsale.findOneAndDelete({key: key});
  } catch (err) {
    console.error('cancelList fail', err);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.updatePutonSale = async (req, res) => {
  //console.log('====update puton sale====');
  const key = req.body.key;
  const amount = req.body.amount;
  const currentAmount = req.body.currentAmount;
  try {
    const resOne = await Putonsale.findOne({ key: key });
    resOne.amount = BigNumber.from(currentAmount).sub(amount);
    const _amount = BigNumber.from(currentAmount).sub(amount);
    //console.log(resOne, _amount);
    if (_amount.eq(0)) {
      resOne.isAlive = false;
    }
    resOne.amount = _amount.toString();
    const result = await resOne.save();
    res.send(result);
  } catch (err) {
    console.error('cancelList fail', err);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.getPutonlist = async (req, res) => {
  const key = req.query.key;
  const collectionId = req.query.collectionId;
  const tokenId = req.query.tokenId;
  const chainId = req.query.chainId;
  const _maker = req.query.maker;

  //console.log('=========getPutonlist=========', req.query);
  try {
    const result = key
      ? await Putonsale.findOne({
          key: key,
          isCancel: false,
          isClaim: false,
          isAlive: true,
        })
      : await Putonsale.findOne({
          collectionId: collectionId,
          tokenId: tokenId,
          maker: _maker,
          isCancel: false,
          isClaim: false,
          isAlive: true,
        });
    const fav = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
    });
    const auction = await Auction.find({ key: key });
    const auctionList = [];
    //console.log(result);
    const maker = await User.findOne({ address: _maker }).select([
      'name',
      'avatar',
      'socials',
      'address',
    ]);
    for (let i = 0; i < auction.length; i++) {
      const taker = auction[i].taker;
      const userRes = await User.findOne({ address: taker }).select([
        'name',
        'avatar',
      ]);
      auctionList.push({
        name: userRes.name,
        taker: taker,
        price: auction[i].price,
        amount: auction[i].amount,
        avatar: userRes.avatar,
        auctionTime: auction[i].updatedAt,
        message: auction[i].offer,
      });
    }

    //console.log(fav);
    res.send({
      list: result,
      itemInfo: fav,
      auction: auctionList,
      maker: maker,
    });
  } catch (e) {
    //console.log('getPutonlist wrong ', e);
    res.status(500).send({
      message: e || 'Something went wrong!',
    });
  }
};

exports.getFNFTPutOnSale = async (req, res) => {
  const collectionId = req.query.collectionID;
  const maker = req.query.maker;

  try {
    const result = await Putonsale.aggregate([
      {
        $match: {
          collectionId: collectionId,
          maker: maker,
          isCancel: false,
          isClaim: false,
        },
      },
      {
        $lookup: {
          from: 'items',
          localField: 'tokenId',
          foreignField: 'tokenId',
          as: 'items',
        },
      },
      {
        $lookup: {
          from: 'fnftstates',
          localField: 'tokenId',
          foreignField: 'tokenID',
          as: 'fnft',
        },
      },
      {
        $match: { 'items.mode': 1 },
      },
      {
        $project: {
          tokenId: 1,
          'items.metadata': 1,
          'fnft.Total': 1,
          'fnft.current': 1,
        },
      },
    ]);
    console.log('FNFT putonsale list', result);
    res.send(result);
  } catch (err) {
    console.error('updateFNFTstate fail', err);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};

exports.getNFTList = async (req, res) => {
  const page = Math.max(0, req.query.page || 1) - 1;
  const perPage = req.query.perPage || 10;
  const source = req.query.source;
  const status = req.query.status;
  const tag = req.query.tag;
  const category = req.query.category;
  const nftType = req.query.nftType;
  const nftMode = req.query.nftMode;
  const volume = req.query.volume;
  const price = req.query.price;
  const listing = req.query.listing;
  const filter = req.query.filter;
  const sort = req.query.sort;
  const reqLevel = req.query.reqLevel;
  const search = req.query.search;
  const storeId = req.query.storeId;
  const currentUser = req.userAddress;

  // Check is req is from Admin Dashboard
  let isAdmin = false;
  if (reqLevel === 'admin') {
    const userData = await User.findOne({ address: req.userAddress });
    if (userData.accessLevel > 0) {
      isAdmin = true;
    }
  }

  // Setting up Queries
  let query = isAdmin
    ? {}
    : {
        isShadowListed: false,
      };
  let sortQuery = {};

  // Sorting
  if (sort === 'featured' || status === 'featured') {
    query.featurePriority = { $gt: 0 };
    sortQuery.featurePriority = -1;
  }
  if (sort === 'top' || status === 'top') {
    query.amountSold = { $gt: 0 };
    sortQuery.amountSold = -1;
  }
  if (sort === 'createdAt') {
    sortQuery.createdAt = -1;
  }

  // Filter
  if (search !== undefined) {
    let searchText = search;
    const foundUser = await User.findOne({
      // name: { $regex: searchText, $options: "i" },
      name: searchText,
    });
    const makerAddress = foundUser !== null ? foundUser.address : searchText;
    query.$or = [
      { key: searchText },
      { tokenId: searchText },
      { maker: makerAddress },
      { category: searchText },
      { name: { $regex: searchText, $options: 'i' } },
      { description: { $regex: searchText, $options: 'i' } },
    ];
  }
  if (status === 'shadowListed') {
    query.isShadowListed = isAdmin ? true : false;
  }
  // if (filter === "featuredOnly") {
  //   query.featurePriority = { $gt: 0 };
  //   sortQuery.featurePriority = -1;
  // }

  if (nftMode !== undefined && nftMode !== 'all' && nftMode !== '') {
    query = { ...query, _type: nftMode };
  }
  if (typeof nftType !== 'undefined' && nftType !== 'all' && nftType !== '') {
    query = { ...query, _type: nftType };
  }

  if (
    typeof category !== 'undefined' &&
    category !== 'All' &&
    category !== ''
  ) {
    query = { ...query, category };
  }
  if (typeof tag !== 'undefined' && tag !== 'All' && tag !== '') {
    query = { ...query, tag };
  }
  if (listing === 'Newest') {
    sortQuery.createdAt = -1;
  }
  if (listing === 'Oldest') {
    sortQuery.createdAt = 1;
  }
  if (price === 'Highest Price') {
    sortQuery.endPrice = -1;
  }
  if (price === 'Lowest Price') {
    sortQuery.endPrice = 1;
  }
  //console.log('===getPutonsalePageNum===', req.query);

  // ===================== StoreId =====================
  if (typeof storeId !== 'undefined') {
    const foundStore = await Store.findOne({ _id: storeId });

    if (foundStore.type === 'open') {
      query = { ...query, stores: storeId };
    } else if (
      currentUser &&
      currentUser.length !== 0 &&
      foundStore.type === 'closed'
    ) {
      const foundUser = await User.findOne({ address: currentUser });
      const isMember = foundStore.members.some(
        (storeMember) => storeMember.address === foundUser.address
      );
      if (foundStore.owner === foundUser.address || isMember) {
        query = { ...query, stores: storeId };
      } else {
        res.send({
          data: [],
          perPage: 0,
          page: 0,
          total: 0,
          lastPage: 0,
          firstPageURL: '',
          lastPageURL: '',
          from: 0,
          to: 0,
          links: [],
          path: '',
        });
        return;
      }
    } else {
      res.send({
        data: [],
        perPage: 0,
        page: 0,
        total: 0,
        lastPage: 0,
        firstPageURL: '',
        lastPageURL: '',
        from: 0,
        to: 0,
        links: [],
        path: '',
      });
      return;
    }
  }
  try {
    // const itmCnt = await Putonsale.count({ isAlive: { $ne: false } });
    // const result = await Putonsale.find({isAlive: { $ne: false }, ...query}).limit(perPage).skip(perPage * pageNum)

    let result = await Putonsale.find({
      isAlive: { $ne: false },
      isCancel: false,
      isClaim: false,
      ...query,
    })
      .sort(sortQuery)
      .skip(perPage * page)
      .limit(perPage);

    // //console.log("**************itmCnt***", itmCnt)
    const itemCount = await Putonsale.countDocuments({
      isAlive: { $ne: false },
      isCancel: false,
      isClaim: false,
      ...query,
    });

    const relationInfo = [];
    for (let i = 0; i < result.length; i++) {
      // //console.log("*****************result[i]", result[i])
      const user = await User.findOne({ address: result[i].maker }).select([
        'name',
        'avatar',
        'address',
      ]);
      if (user) {
        const item = await Item.findOne({
          collectionId: result[i].collectionId,
          tokenId: result[i].tokenId,
        });
        // //console.log("------------",item)
        const nftData = {
          username: user?.name,
          avatar: user?.avatar,
          address: user?.address,
          collectionLikes: item?.likes,
          metadata: item?.metadata,
          mode: item?.mode,
          name: result[i]?.name,
          description: result[i]?.description,
          key: result[i]?.key,
          maker: result[i]?.maker,
          chainId: result[i]?.chainId,
          tokenId: result[i]?.tokenId,
          amount: result[i]?.amount,
          amountInitial: result[i]?.amountInitial,
          amountSold: result[i]?.amountSold,
          royaltyFee: result[i]?.royaltyFee,
          admin: result[i]?.admin,
          coinType: result[i]?.coinType,
          expDate: result[i]?.expDate,
          price: result[i]?.price,
          endPrice: result[i]?.endPrice,
          isFNFT: result[i]?.isFNFT,
          _type: result[i]?._type,
          saleMode: result[i]?.saleMode,
          category: result[i]?.category,
          isAlive: result[i]?.isAlive,
          collectionId: result[i]?.collectionId,
          featurePriority: result[i]?.featurePriority,
          createdAt: result[i]?.createdAt,
          stores: result[i]?.stores,
        };
        if (isAdmin) {
          nftData.isShadowListed = result[i].isShadowListed;
        }
        relationInfo.push(nftData);
      }
    }

    // let filerResult = relationInfo;
    // if (typeof nftMode !== "undefined" && nftMode !== "all" && nftMode !== "") {
    //   filerResult = filerResult.filter((el) => el.mode === Number(nftMode));
    // }
    // if (typeof nftType !== "undefined" && nftType !== "all" && nftType !== "") {
    //   filerResult = filerResult.filter(
    //     (el) => el.fnft_Type === Number(nftType)
    //   );
    // }

    // const itmCnt_1 = filerResult.length;
    // filerResult = filerResult.slice(pageNum * perPage, (pageNum + 1) * perPage);

    res.send({
      data: relationInfo,
      perPage: +perPage,
      page: page + 1,
      total: itemCount,
      lastPage: Math.floor(itemCount / perPage),
      firstPageURL: '',
      lastPageURL: '',
      from: 0,
      to: 0,
      links: [],
      path: '',
    });
  } catch (err) {
    console.error('Create user fail', err);
    res.status(500).send({ message: err || 'Something went wrong' });
  }
};
