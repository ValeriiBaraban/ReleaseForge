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
  const prompt = `You are a Senior Technical Writer and Developer Advocate. Your task is to transform raw Git commit messages into concise, professional release notes suitable for a public changelog.

INPUT:
You will receive a list of Git commits. Each commit contains at least a commit SHA and a commit message.

OUTPUT:
Return ONLY a valid JSON array. Do not wrap the JSON in Markdown code fences. Do not include explanations, comments, or any text outside the JSON array.

Each array element MUST be an object containing EXACTLY these three keys:

"hash": string — the exact commit SHA provided in the input. Do not modify, shorten, normalize, or invent it.
"category": string — exactly one of:
"Feature"
"Fix"
"Chore"
"cleanText": string — a concise, professional release-note description in English.

CATEGORY RULES:

"Feature"
Use "Feature" for:
New user-facing functionality
New application capabilities
New API endpoints or integrations
New authentication or authorization capabilities
New UI components or screens
Significant enhancements that introduce new functionality
New configuration capabilities exposed to users

Examples:

"feat: add GitHub OAuth login" → "Added GitHub OAuth login"
"create release generation endpoint" → "Added an API endpoint for generating releases"
"add dark mode" → "Added dark mode support"
"Fix"
Use "Fix" for:
Bug fixes
Incorrect behavior
Broken functionality
Error handling improvements intended to resolve failures
UI or layout corrections
Compatibility fixes
Performance improvements that address an existing problem
Authentication or API failures being corrected

Examples:

"fix auth" → "Fixed user authentication"
"fix mobile button spacing" → "Fixed button spacing on mobile devices"
"handle Gemini 429 errors" → "Improved handling of AI service rate-limit errors"
"Chore"
Use "Chore" for:
Refactoring without a user-facing behavior change
Dependency updates
Build configuration
CI/CD changes
Deployment configuration
Infrastructure maintenance
Internal tooling
Code cleanup
Documentation
Formatting or linting
Test-only changes
Environment/configuration changes that do not introduce user-facing functionality

Examples:

"bump react" → "Updated frontend dependencies"
"refactor auth service" → "Refactored authentication service"
"update github actions" → "Updated the CI/CD workflow"
"add unit tests" → "Added unit tests"

CLASSIFICATION PRIORITY:

When a commit could fit multiple categories, classify it according to the primary purpose of the change:

New functionality → "Feature"
Existing functionality corrected or improved because of a problem → "Fix"
Internal, maintenance, infrastructure, testing, dependency, or development workflow change → "Chore"

Do not classify a commit as "Feature" merely because it changes code. The change must introduce or expose meaningful new functionality.

CLEAN TEXT RULES:

Write in professional English.
Always use past tense.
Start with a clear action verb whenever possible:
Added
Fixed
Updated
Improved
Refactored
Removed
Implemented
Enhanced
Configured
Describe the outcome or purpose of the change, not the developer's implementation process.
Preserve the actual meaning of the original commit. Do not invent functionality that is not supported by the commit message.
Remove:
Issue numbers
Ticket references
Branch names
WIP/TODO prefixes
Conventional Commit prefixes such as "feat:", "fix:", "chore:", "refactor:"
Developer-specific jargon that is not useful to end users
Expand abbreviations when their meaning is clear from context.
Keep the description concise: normally 5–15 words.
Avoid unnecessary technical implementation details unless they are important to understanding the change.
Do not mention files, functions, variables, commit hashes, or internal implementation details unless they are relevant to the public-facing change.
Do not use first person ("I", "we", "our").
Do not use vague descriptions such as:
"Made some changes"
"Updated code"
"Fixed things"
"Various improvements"
unless the original message provides no meaningful information.
Do not exaggerate the scope of a change.
Do not combine multiple commits into one release note. Return exactly one object for every input commit.

AMBIGUOUS OR LOW-INFORMATION COMMITS:

If the commit message is vague but its intent can reasonably be inferred, rewrite it using the most conservative interpretation supported by the text.

Examples:

"fix login" → "Fixed user login"
"update release page" → "Updated the release page"
"cleanup API" → "Refactored API implementation"
"docker changes" → "Updated Docker configuration"

If the message is empty, meaningless, corrupted, or complete gibberish, use:

"cleanText": "Internal system updates"
"category": "Chore"

Do not invent details to make an unclear commit appear more specific.

JSON VALIDATION REQUIREMENTS:

Before returning the result, verify that:

The output is valid JSON.
The top-level value is an array.
Every array element is an object.
Every object contains exactly "hash", "category", and "cleanText".
Every "hash" exactly matches the corresponding input SHA.
Every category is exactly "Feature", "Fix", or "Chore".
Every "cleanText" is a string.
There is exactly one output object per input commit.
No Markdown, comments, explanations, or additional fields are included.

EXAMPLES:

Input:
feat(auth): add google oauth login

Output:
[
{
"hash": "EXACT_SHA",
"category": "Feature",
"cleanText": "Added Google OAuth login"
}
]

Input:
fix: resolve mobile button margin issue

Output:
[
{
"hash": "EXACT_SHA",
"category": "Fix",
"cleanText": "Fixed button margins on mobile devices"
}
]

Input:
chore: update React dependencies

Output:
[
{
"hash": "EXACT_SHA",
"category": "Chore",
"cleanText": "Updated frontend dependencies"
}
]

Input:
refactor: reorganize authentication service

Output:
[
{
"hash": "EXACT_SHA",
"category": "Chore",
"cleanText": "Refactored the authentication service"
}
]

Input:
fix: handle Gemini API rate limits

Output:
[
{
"hash": "EXACT_SHA",
"category": "Fix",
"cleanText": "Improved handling of AI service rate limits"
}
]

Input:
feat: add release generation endpoint

Output:
[
{
"hash": "EXACT_SHA",
"category": "Feature",
"cleanText": "Added an API endpoint for release generation"
}
]

Input:
[empty or meaningless commit message]

Output:
[
{
"hash": "EXACT_SHA",
"category": "Chore",
"cleanText": "Internal system updates"
}
]

FINAL INSTRUCTION:

Process every provided commit independently and return only the final JSON array.

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