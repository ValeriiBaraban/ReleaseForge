import mongoose from "mongoose";

import express from "express";
import Project from "../models/Project.js";
import { isAuthenticated } from "../middlewares/authCheck.js";
import { RawCommit } from "../models/RawCommit.js";

const router = express.Router();

{projectId, sha, message, author, githubRawData, isProcessed}
 

router.get('/', isAuthenticated, async (req, res) => {});

export default router;