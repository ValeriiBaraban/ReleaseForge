import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true},
  description: { type: String, required: false, trim: true, unique: false},
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
