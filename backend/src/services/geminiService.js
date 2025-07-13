const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateNoteSummary(notes) {
    try {
      if (!notes || notes.length === 0) {
        return {
          success: false,
          message: 'No notes provided for summary generation'
        };
      }

      const filteredNotes = notes.filter(note => note && note.trim() !== '');
      
      if (filteredNotes.length === 0) {
        return {
          success: false,
          message: 'No valid notes found for summary generation'
        };
      }

      const prompt = `
        You are an AI assistant helping to summarize invoice item notes for business documentation.
        
        Please analyze the following notes from an invoice and provide a concise, professional summary:
        
        Notes:
        ${filteredNotes.map((note, index) => `${index + 1}. ${note}`).join('\n')}
        
        Please provide:
        1. A brief summary highlighting the key points
        2. Any important requirements or specifications mentioned
        3. Notable concerns or special instructions
        
        Keep the summary professional, concise, and focused on business-relevant information.
        Format the response as a well-structured summary paragraph.
      `;

      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const summary = result.text;

      return {
        success: true,
        summary: summary.trim(),
        notesCount: filteredNotes.length
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        message: 'Failed to generate summary. Please try again later.',
        error: error.message
      };
    }
  }

  async isServiceAvailable() {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          available: false,
          message: 'Gemini API key not configured'
        };
      }

      const testResult = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: 'Hello, this is a test.',
      });
      return {
        available: true,
        message: 'Gemini service is available'
      };
    } catch (error) {
      return {
        available: false,
        message: 'Gemini service is not available',
        error: error.message
      };
    }
  }
}

module.exports = new GeminiService();