import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classifyCommitsWithAI(commits) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const simplifiedCommits = commits.map(c => ({
    sha: c.sha,
    message: c.message ? c.message.split('\n')[0] : "No message"
  }));

  const prompt = `
    You are a Senior Technical Writer and Developer Advocate. Your task is to analyze a list of raw Git commit messages and prepare them for a professional public Release Notes changelog.

    Return a STRICT JSON array of objects. Do not wrap the JSON in markdown blocks (e.g., no \`\`\`json).
    
    Each object MUST have exactly these three keys:
    - "hash" (string): The exact commit sha provided.
    - "category" (string): You must classify the commit into STRICTLY ONE of the following three categories:
        * "Feature": New user-facing capabilities, major enhancements, UI/UX additions, or new API endpoints.
        * "Fix": Bug resolutions, error handling, layout corrections, or performance improvements.
        * "Chore": Code refactoring, dependency updates, CI/CD pipeline changes, documentation, or internal maintenance.
    - "cleanText" (string): Rewrite the technical, abbreviated, or poorly written commit message into a clear, business-oriented description.
    
    Rules for "cleanText":
    1. Output MUST be in professional English.
    2. Use past tense (e.g., "Added...", "Fixed...", "Updated...", "Refactored...").
    3. Remove issue tracker numbers, internal jargon, or WIP prefixes.
    4. Expand vague messages into sensible descriptions (e.g., instead of "fix auth", write "Fixed user authentication issue").
    5. If a message is complete gibberish or empty, write "Internal system updates".

    Examples of transformation:
    - Input: "feat(auth): add google oauth login" -> Output: "Added Google OAuth login capability" (Category: Feature)
    - Input: "fix button margin on mobile" -> Output: "Fixed button margins on mobile devices" (Category: Fix)
    - Input: "bump react to v18" -> Output: "Updated frontend dependencies" (Category: Chore)
    - Input: "WIP refactoring" -> Output: "Refactored internal architecture" (Category: Chore)

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