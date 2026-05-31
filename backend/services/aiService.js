import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const commitSchema = {
  type: SchemaType.ARRAY,
  description: "List of commits with categories and clean text",
  items: {
    type: SchemaType.OBJECT,
    properties: {
      hash: {
        type: SchemaType.STRING,
        description: "Commit hash",
      },
      category: {
        type: SchemaType.STRING,
        description: "Strictly one of the values: Feature, Fix, Chore",
      },
      cleanText: {
        type: SchemaType.STRING,
        description: "Human-readable description of changes",
      },
    },
    required: ["hash", "category", "cleanText"],
  },
};

async function classifyCommitsWithAI(commits) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: commitSchema,
    },
  });

  const simplifiedCommits = commits.map(c => ({
    sha: c.sha,
    message: c.message ? c.message.split('\n')[0] : "No message"
  }));

  const prompt = `
   You are a technical writer. Analyze the list of git commits.
      Your task:

      Assign a category to each commit:
      Feature — for new functionality
      Fix — for bug fixes
      Chore — for configuration, refactoring, dependencies, and miscellaneous maintenance tasks
      Field cleanText — rewrite the technical or poorly written commit message into a clear business-oriented description in Russian.

      Examples:

      "fix css margin" → "Fixed interface spacing issues"
      "Merge pull request #45" → "Codebase updated"

      Commits to process:
          ${JSON.stringify(simplifiedCommits)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const parsedResponse = JSON.parse(result.response.text());
    return parsedResponse;
  } catch (error) {
    console.error("error ai", error);
    return []; 
  }
}

export default classifyCommitsWithAI;