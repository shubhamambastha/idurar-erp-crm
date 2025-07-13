const geminiService = require('@/services/geminiService');

const generateSummary = async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !Array.isArray(notes)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notes format. Expected an array of notes.'
      });
    }

    const result = await geminiService.generateNoteSummary(notes);

    if (result.success) {
      return res.status(200).json({
        success: true,
        summary: result.summary,
        notesCount: result.notesCount,
        message: 'Summary generated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to generate summary'
      });
    }
  } catch (error) {
    console.error('Generate Summary Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating summary',
      error: error.message
    });
  }
};

module.exports = generateSummary;