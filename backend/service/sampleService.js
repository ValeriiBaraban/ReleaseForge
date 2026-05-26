import Sample from '../models/Sample.js';

export const processSampleText = async (textToSave) => {
  const newSample = new Sample({ text: textToSave });
  await newSample.save();

  await new Promise(resolve => setTimeout(resolve, 5000));

  const savedRecord = await Sample.findById(newSample._id);

  return savedRecord;
};
//sample
