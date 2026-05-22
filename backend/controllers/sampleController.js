import * as sampleService from '../service/sampleService.js';

export const handleSampleSubmit = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'no text provided' });
    }

    const result = await sampleService.processSampleText(text);

    res.status(200).json({ 
      success: true, 
      message: `Success! Saved and read from DB: "${result.text}" (ID: ${result._id})` 
    });
    
  } catch (error) {
    console.error('Error in sampleController:', error);
    res.status(500).json({ error: 'Internal server error while working with the database' });
  }
};