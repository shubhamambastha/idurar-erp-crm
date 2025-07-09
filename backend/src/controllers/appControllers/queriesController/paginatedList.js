const paginatedList = async (Model, req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;

    const { sortBy = 'created', sortValue = -1, filter, equal } = req.query;

    const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];

    let fields;

    fields = fieldsArray.length === 0 ? {} : { $or: [] };

    for (const field of fieldsArray) {
      fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
    }

    // Additional filter for status
    let statusFilter = {};
    if (req.query.status) {
      statusFilter.status = req.query.status;
    }

    // Query the database for a list of all results
    const resultsPromise = Model.find({
      removed: false,
      [filter]: equal,
      ...statusFilter,
      ...fields,
    })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortValue })
      .populate('customer', 'name email phone')
      .exec();

    // Counting the total documents
    const countPromise = Model.countDocuments({
      removed: false,
      [filter]: equal,
      ...statusFilter,
      ...fields,
    });

    // Resolving both promises
    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    // Calculating total pages
    const pages = Math.ceil(count / limit);

    // Getting Pagination Object - ensure all required fields are present
    const pagination = { 
      page: page || 1, 
      pages: pages || 1, 
      count: count || 0 
    };
    
    const response = {
      success: true,
      result: result || [],
      pagination,
      message: count > 0 ? 'Successfully found all documents' : 'Collection is Empty',
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: [],
      pagination: { page: 1, pages: 1, count: 0 },
      message: error.message || 'Error fetching data',
    });
  }
};

module.exports = paginatedList;
