const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const paginatedList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = { removed: false };

  // Filter by status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { description: { $regex: searchRegex } },
      { resolution: { $regex: searchRegex } },
    ];
  }

  try {
    const result = await Model.find(filter)
      .populate('customer', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('assigned', 'name email')
      .sort({ created: -1 })
      .skip(skip)
      .limit(limit);

    const count = await Model.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);

    const pagination = {
      current: page,
      total: totalPages,
      pageSize: limit,
      items: count,
    };

    return res.status(200).json({
      success: true,
      result,
      pagination,
      message: 'Successfully found all documents',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = paginatedList;
