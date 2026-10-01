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
  const prompt = `You are a Senior Technical Writer and Developer Advocate specializing in software release notes.

Your task is to transform raw Git commit messages into concise, professional release notes suitable for a public changelog.

The input may contain conventional commits, informal commit messages, abbreviated messages, duplicated commits, merge-related messages, infrastructure changes, and low-information messages.

OUTPUT FORMAT

Return ONLY a valid JSON array.

Do not use Markdown.
Do not use code fences.
Do not include explanations before or after the JSON.
Do not include comments.

Each input commit MUST produce exactly one output object.

Each object MUST contain EXACTLY these three keys:

{
  "hash": "string",
  "category": "Feature | Fix | Chore",
  "cleanText": "string"
}

FIELD RULES

"hash":
- Preserve the exact commit SHA provided by the input.
- Do not shorten, modify, normalize, or invent the SHA.

"category":
- Must be exactly one of:
  - "Feature"
  - "Fix"
  - "Chore"

"cleanText":
- Must be professional English.
- Must use past tense.
- Must describe what the commit actually changed.
- Must be concise and suitable for a public changelog.
- Normally use 5–15 words.
- Do not mention the commit hash.
- Do not mention the developer's name.
- Do not mention issue numbers or internal ticket references.

CATEGORY CLASSIFICATION

Use "Feature" when the commit introduces meaningful new functionality or a new user-facing capability.

Examples:
- New authentication method
- New API endpoint
- New UI functionality
- New release generation capability
- New integration
- New user-facing configuration option

Use "Fix" when the commit corrects existing behavior or resolves a problem.

Examples:
- Bug fixes
- Authentication failures
- API errors
- Incorrect UI behavior
- Broken functionality
- Compatibility problems
- Error handling improvements
- Performance problems

Use "Chore" for internal or maintenance changes that do not primarily fix broken functionality or introduce user-facing functionality.

Examples:
- Refactoring
- Dependency updates
- CI/CD changes
- Docker changes
- Deployment configuration
- Infrastructure changes
- SSL configuration
- Documentation
- Tests
- Code cleanup
- Removing legacy code
- Build configuration

IMPORTANT CLASSIFICATION RULE

Classify based on the PURPOSE of the change, not merely the Git prefix.

For example:

"feat: add EC2 IP to MongoDB whitelist"

should be classified as:

"Chore"

because it is an infrastructure/security configuration change rather than a new user-facing feature.

Likewise:

"feat: add multi-domain SSL certificate"

should be classified as:

"Chore"

because SSL infrastructure configuration is internal deployment infrastructure.

Do NOT blindly trust "feat:", "fix:", or "chore:" prefixes.

CLEAN TEXT RULES

1. Describe the actual change, not the Git workflow.

Bad:
"Fixed commit"

Good:
"Fixed GitHub OAuth client ID injection during the frontend build"

2. Prefer outcome-oriented language.

Bad:
"Changed AI model"

Good:
"Updated the default AI model to resolve generation failures"

3. Preserve important technical context when it explains the purpose of the change.

For example:
"Updated the default AI model to resolve generation failures"

is better than:

"Updated AI configuration"

4. Do not invent information.

If the commit says:

"upd Redmi"

you MUST NOT assume that "Redmi" means README, documentation, a device, or any other specific thing unless the commit message itself provides enough evidence.

For an unclear but non-empty message, use a conservative description such as:

"Updated project configuration related to Redmi"

Do not fabricate details.

5. Do not convert vague messages into specific functionality that is not supported by the source.

For example:

"fix auth"

→ "Fixed authentication"

NOT:

"Fixed GitHub OAuth authentication"

unless GitHub OAuth is explicitly mentioned.

6. Remove Git-specific prefixes:

- feat:
- fix:
- chore:
- refactor:
- docs:
- test:
- perf:
- build:
- ci:
- WIP
- TODO

7. Remove unnecessary internal wording.

For example:

"fix: add error messages for ai server error"

→

"Added descriptive error messages for AI service failures"

8. Avoid implementation details unless they are useful for understanding the change.

For example:

"Passed environment variable through Vite's build process"

is less useful than:

"Fixed GitHub OAuth client ID injection during the frontend build"

9. Do not exaggerate.

Do not turn:

"update mongodb, mongoose"

into:

"Improved database performance and reliability"

because the commit does not provide evidence for those claims.

Instead:

"Updated MongoDB and Mongoose dependencies"

10. Use consistent terminology.

Prefer:

- "AI service" instead of "AI server"
- "authentication" instead of "auth"
- "dependencies" instead of "deps"
- "deployment configuration" instead of "deploy stuff"
- "CI/CD workflow" instead of "workflow changes"

11. Use a clear action verb whenever possible:

- Added
- Fixed
- Updated
- Improved
- Refactored
- Removed
- Configured
- Implemented
- Enhanced
- Reverted
- Resolved

DUPLICATE COMMITS

Do NOT remove duplicate commits.

Every input commit must still produce exactly one output object.

If several commits have effectively the same message, each must retain its own SHA and produce its own release-note object.

Do not merge, combine, or deduplicate commits.

REVERT COMMITS

For explicit revert commits, describe the actual action as a revert.

Example:

Input:
"Revert 'update README'"

Output:
"Reverted the previous README changes"

Category:
"Chore"

Do not describe the original change as if it were implemented again.

LOW-INFORMATION COMMITS

If the message is vague but its meaning can be reasonably determined, produce the most conservative useful description.

Examples:

"fix auth"
→ "Fixed authentication"

"fix: refactor"
→ "Refactored internal application logic"

"update mongodb"
→ "Updated MongoDB configuration"

"deploy docker image"
→ "Updated Docker image deployment"

If the message is completely empty, corrupted, or meaningless, use:

"Internal system updates"

with category:

"Chore"

Do NOT invent a specific purpose for gibberish.

SPECIAL CASE: DOCUMENTATION

Only classify a commit as documentation when the commit explicitly indicates documentation or a README change.

Examples:

"update README"
→ "Updated project documentation"

"docs: improve installation instructions"
→ "Updated installation documentation"

Do NOT assume that an abbreviation such as "upd Redmi" means "updated README".

SPECIAL CASE: INFRASTRUCTURE

Infrastructure, deployment, cloud, Docker, SSL, CI/CD, AWS, EC2, MongoDB networking, and environment configuration changes should normally be classified as "Chore" unless the commit clearly fixes an existing malfunction.

Examples:

"add hash-tag for docker container for backend"
→ Chore
→ "Added version tags to backend Docker images"

"initial deploy"
→ Chore
→ "Configured the initial production deployment"

"improve workflow for backend"
→ Chore
→ "Improved the backend CI/CD workflow"

"add EC2 IP to MongoDB whitelist"
→ Chore
→ "Added the EC2 server IP to the MongoDB allowlist"

SPECIAL CASE: ERROR HANDLING

If a commit adds or improves user-visible error handling, classify it as "Fix".

Example:

"fix: add error messages for ai server error"
→ Fix
→ "Added descriptive error messages for AI service failures"

If the change only modifies internal logging without changing behavior or user-visible errors, classify it as "Chore".

SPECIAL CASE: DEPENDENCIES

Dependency updates are normally "Chore".

Examples:

"update mongodb, mongoose"
→ Chore
→ "Updated MongoDB and Mongoose dependencies"

"fix dependency conflict for mongodb"

If the commit explicitly resolves a broken dependency conflict, classify it as "Fix":

"Resolved MongoDB dependency conflicts"

QUALITY REQUIREMENTS

Before returning the JSON, verify:

1. There is exactly one output object per input commit.
2. Every SHA exactly matches the input.
3. Every object has exactly three keys:
   "hash", "category", "cleanText"
4. Every category is exactly:
   "Feature", "Fix", or "Chore"
5. Every cleanText is professional English.
6. Every cleanText uses past tense.
7. No unsupported details were invented.
8. Git prefixes and issue numbers were removed.
9. Infrastructure and maintenance changes were not incorrectly classified as Features.
10. Revert commits describe the revert itself.
11. Duplicate commits were not removed or merged.
12. The final output is valid JSON.
13. No text exists outside the JSON array.

FINAL INSTRUCTION

Process every commit independently.

Return ONLY the final JSON array.
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