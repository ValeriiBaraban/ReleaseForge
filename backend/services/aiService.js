import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classifyCommitsWithAI(commits) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.8-flash", 
  });

  const simplifiedCommits = commits.map(c => ({
    sha: c.sha,
    message: c.message ? c.message.split('\n')[0] : "No message"
  }));

  // Construct the prompt for the AI model
  const prompt = `You are a Senior Technical Writer and Developer Advocate. Your task is to analyze a list of raw Git commit messages and prepare them for a professional public Release Notes changelog.

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
2. Use past tense (e.g., "Added...", "Fixed...", "Updated...").
3. Remove issue tracker numbers, internal jargon, or WIP prefixes.
4. Expand vague messages into sensible descriptions (e.g., instead of "fix auth", write "Fixed user authentication issue").
5. If a message is complete gibberish or empty, write "Internal system updates".

6. Preserve the original meaning of the commit. Do not invent functionality or technical details that are not reasonably supported by the message.
7. Use the commit message's context to produce a natural, specific release-note description when the intended meaning is clear.
8. Classify commits based primarily on the actual change described, not only on conventional commit prefixes such as "feat:", "fix:", or "chore:".
9. Keep descriptions concise and suitable for a public changelog. Prefer clear, outcome-oriented wording over implementation details.
10. Do not make vague messages unnecessarily specific when the intended meaning cannot be determined reliably.

Examples of transformation:
- Input: "feat(auth): add google oauth login" -> Output: "Added Google OAuth login capability" (Category: Feature)
- Input: "fix button margin on mobile" -> Output: "Fixed button margins on mobile devices" (Category: Fix)
- Input: "bump react to v18" -> Output: "Updated frontend dependencies" (Category: Chore)
- Input: "WIP refactoring" -> Output: "Refactored internal architecture" (Category: Chore)
Commits to process:
    ${JSON.stringify(simplifiedCommits)}`;

  try {
    const result = await model.generateContent(prompt);
    let rawText = result.response.text();
    
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedResponse = JSON.parse(rawText);
    return parsedResponse;
  } catch (error) {
  console.error("AI Error:", error);

  if (error.status === 429) {
    const err = new Error(
      'Limit reached: The AI service is currently overloaded with requests. Please try again later.'
    );
    err.status = 429;
    throw err;

  } else if (error.status === 503 || error.status === 500) {
    const err = new Error(
      'Service temporarily unavailable: The AI service is currently overloaded with requests. Please try again later.'
    );
    err.status = error.status;
    throw err;
  }

  throw new Error(
    'Failed to generate release notes due to AI service failure.'
  );
}
}

export default classifyCommitsWithAI;