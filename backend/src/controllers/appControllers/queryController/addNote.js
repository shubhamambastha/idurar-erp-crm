const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const addNote = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // Check if required fields are provided
  if (!content || content.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Note content is required',
    });
  }

  try {
    const query = await Model.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    const newNote = {
      content: content.trim(),
      createdBy: req.admin._id,
      created: new Date(),
    };

    query.notes.push(newNote);
    query.updated = new Date();

    await query.save();

    // Populate the response
    await query.populate('notes.createdBy', 'name email');

    return res.status(200).json({
      success: true,
      result: query,
      message: 'Note added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = addNote;
