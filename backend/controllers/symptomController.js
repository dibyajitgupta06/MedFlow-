import { analyzeSymptoms } from '../services/geminiService.js';

/**
 * @desc    Analyze symptoms using Google Gemini AI
 * @route   POST /api/symptoms/check
 * @access  Private/Patient
 */
export const checkSymptoms = async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim().length < 5) {
    return res.status(400).json({
      message: 'Please provide a clear description of your symptoms (at least 5 characters).',
    });
  }

  try {
    const analysis = await analyzeSymptoms(symptoms);
    return res.json(analysis);
  } catch (error) {
    console.error('Symptom Controller Error:', error);
    return res.status(500).json({
      message: 'Symptom analysis failed. Please consult a doctor directly.',
    });
  }
};
