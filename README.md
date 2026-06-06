ReleaseForge 🛠️
URL
https://projectsummer.click

Automated Changelog Builder

# ReleaseForge 🛠️
**URL**
[https://projectsummer.click](https://projectsummer.click)

**Automated Changelog Builder**

![Structure](./source/image.png)


Local Setup Instructions
To run ReleaseForge locally on your machine, you will need to start both the frontend and backend development servers.
---

## 🚀 Local Setup Instructions

### Prerequisites
Before you begin, ensure you have the following installed and set up:
* **Node.js** (v18 or higher)
* A free **MongoDB Atlas** account and cluster.
* A **GitHub** account.

### 1. GitHub OAuth Setup
To enable login functionality, you must create an OAuth App in GitHub:
1. Go to your GitHub **Settings** -> **Developer Settings** -> **OAuth Apps** -> **New OAuth App**.
2. Set the **Homepage URL** to `http://localhost:5173`
3. Set the **Authorization callback URL** to `http://localhost:8080/api/auth/github/callback`
4. Generate a Client Secret. Save both the **Client ID** and **Client Secret** for the next step.

### 2. Backend Setup & Environment Variables
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
Create a .env file in the backend directory and paste the following template. Fill in the variables using your MongoDB URI and the GitHub credentials you just created:

```
PORT=8080
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Security and Sessions
SESSION_SECRET=your_super_secret_session_string
ENCRYPTION_KEY=your_encryption_key_here_1234567890

# URLs
CLIENT_URL=http://localhost:5173
GITHUB_AUTH_URL=http://localhost:8080/api/auth/github/callback

# GitHub OAuth App Configuration
GH_CLIENT_ID=your_github_client_id_here
GH_CLIENT_SECRET=your_github_client_secret_here

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key_here

```



Start the backend server:

Bash
npm run dev
3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:

Bash
cd frontend
npm install
Create a .env file in the frontend directory and add the backend API URL so Vite knows where to send requests:

Фрагмент кода
VITE_API_URL=http://localhost:8080
Start the frontend application:

Bash
npm run dev
To run ReleaseForge locally on your machine, you will need to set up your environment variables and start both the frontend and backend development servers.

### 1. Environment Variables
Create a `.env` file in the `backend` directory and paste the following template. Fill in the missing values with your own credentials:

```env
# Server Settings
PORT=8080
NODE_ENV=development

# Database Connection (MongoDB Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Security and Sessions
SESSION_SECRET=your_super_secret_session_string
ENCRYPTION_KEY=your_encryption_key_here_1234567890

# Environment URLs
CLIENT_URL=http://localhost:5173
GITHUB_AUTH_URL=http://localhost:8080/api/auth/github/callback

# GitHub OAuth App Configuration (from GitHub Developer Settings)
GH_CLIENT_ID=your_github_client_id_here
GH_CLIENT_SECRET=your_github_client_secret_here

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key_here

```

Start the Backend:

Open a terminal and navigate to the backend directory:
cd backend

Install the necessary dependencies (first time only):
npm install

Start the backend server:
npm run dev

Start the Frontend:

Open a new terminal window and navigate to the frontend directory:
cd frontend

Install the necessary dependencies (first time only):
npm install

Start the frontend application:
npm run dev

📢 Week 8 Update: Project Status (Proof of Concept)
✅ Work Completed (Project Setup & Framework):

Express Server & Middleware: Fully functional Express server running, configured with CORS, JSON parsing, and secure proxy trust for deployment.

Database Connection: Successful integration with MongoDB Atlas using Mongoose.

Authentication Framework: Implemented a robust OAuth workflow using passport-github2. Users can successfully log in via GitHub, and their profiles (along with the necessary accessToken for future API calls) are saved directly into the MongoDB database.

Session Management: Configured secure, HTTP-only cookies and integrated connect-mongo to store active user sessions persistently in the database.

Frontend Scaffolding: React SPA initialized with React Router. Built a landing/login page and a protected Dashboard component that successfully verifies user sessions with the backend.

API Routing Framework: Modularized routing structure is in place (e.g., /api/auth, /api/commits), ready for expansion.

🚧 Work Still Needs to be Done:

Complete the remaining Mongoose schemas (Project, Release, ChangelogItem).

Finish the CRUD API routes for managing projects and generated changelogs.

Connect the frontend Dashboard to the /api/commits route to fetch and display the user's real GitHub commit history.

Build the interactive UI for parsing and categorizing commits into "Features", "Fixes", etc.

Final UI styling (using vanilla CSS) and production deployment tweaks on AWS.

ReleaseForge is a productivity tool tailored for software development teams, independent developers, and product managers. It focuses on the product release lifecycle by streamlining the creation of clean, professional release notes and changelogs.

🛑 Problem Statement
Writing release notes is a tedious task that developers often neglect. Raw Git commit messages are usually too technical or messy for end-users or stakeholders to read.

Translating these commits into a structured, user-friendly changelog (categorized by New Features, Bug Fixes, and Improvements) takes manual effort and time. ReleaseForge solves this by providing a dedicated workspace to import commit data, easily categorize updates, and generate beautifully formatted release pages.

⚙️ Technical Components
The application is built using the MERN stack (MongoDB, Express, React, Node.js) and provisioned using Terraform on AWS and MongoDB Atlas.

🌐 Infrastructure & Deployment
Frontend: Hosted on an AWS S3 bucket and distributed globally via AWS CloudFront for high availability.

Backend: Deployed on an AWS EC2 instance, utilizing AWS SSM (Systems Manager) for secure parameter and secrets management.

Database: MongoDB Atlas cluster integrated with the backend environment.

IaC: The entire cloud architecture is codified and deployed using Terraform.

🌐 External Data Source (API)
Integration with the GitHub REST API. The backend fetches recent commit messages from public repositories to automatically populate draft release notes, saving users from typing everything from scratch.

🗄️ Data Models (MongoDB/Mongoose)
User: Manages authentication and user accounts.

Project: Represents a software product or repository (e.g., "My React App").

Release: Belongs to a Project (e.g., "v1.2.0") and contains publishing dates and statuses (Draft/Published).

ChangelogItem: Individual update entries associated with a Release, including the text and category type (Feature, Fix, Chore).

🛣️ API Routes (Express.js)
Route	Method	Description
/api/auth/login	POST	User authentication and session creation.
/api/auth/register	POST	New user registration.
/api/projects	GET / POST	Get a list of user projects or create a new project.
/api/projects/:projectId/releases	GET / POST	Get all releases for a specific project or create a new one.
/api/releases/:releaseId	GET / PUT / DELETE	Read, update, or delete a specific release (CRUD operations).
/api/github/commits	GET	Receives a repo URL via query parameter (e.g., ?repo=URL), securely calls GitHub API, and returns parsed commit data.
🎯 Meeting Project Requirements
Database Integration: MongoDB Atlas persistently stores user profiles, projects, and the generated release documents.

RESTful API: The Express backend handles all database operations and securely manages the interaction with the external GitHub API.

Frontend Framework: A React SPA provides a drag-and-drop or interactive categorization interface to sort imported commits into changelog sections.

Deployment: The entire infrastructure (AWS EC2/S3/CloudFront and MongoDB Atlas) is deployed as code using Terraform.

Value Generation: The project solves a tangible workflow problem in the software industry, demonstrating a strong understanding of developer tooling.

🗓️ Project Timeline
Week 1: Infrastructure, CI/CD & Scaffolding (Completed)
[x] Deploy MongoDB Atlas and AWS environment (EC2, S3, CloudFront) via Terraform.

[x] Configure CI/CD pipelines for automated deployment to AWS.

[x] Initialize React frontend and Express backend.

[x] Set up environment variables via AWS SSM and connect the database.

Week 2: Database Models & Backend API (Completed)
[x] Build Mongoose schemas (User schema completed, others pending).

[x] Develop the remaining CRUD API routes for projects and releases.

[x] Implement the GitHub API integration route to fetch commits.

Week 3: Frontend Development (Completed)
[x] Build the React UI (Dashboard and Login framework established).

[x] Connect the frontend to the backend API using Axios/Fetch.

[x] Create the logic for parsing and categorizing fetched commits.

Week 4: Styling, Testing & Final Export (Completed)
[x] Implement final CSS styling for the generated changelog view.

[x] Conduct comprehensive API testing via Postman and end-to-end UI testing.

[ ] Final bug fixing, code cleanup, and presentation preparation.

Self-Evaluation
Approach and Results
Building ReleaseForge from scratch for my final project was a great learning experience. I wanted to make a truly useful tool that solves a common developer problem: automatically generating changelogs. The result is a working app: a React frontend, a secure Express backend, a MongoDB database, and reliable cloud hosting.

What worked well
Connecting the app with third-party services turned out really well. GitHub login, fetching commits via their API, and sorting them using the Google Gemini AI worked perfectly. It also really helped that I spent time setting up the infrastructure using Terraform and automated updates (via GitHub Actions). Now, Docker containers are reliably deployed to the AWS EC2 server.

What didn't work well (Challenges)
At the very beginning, debugging the Node.js backend was really hard. It took a lot of time to figure out GitHub login redirects, configure CORS (so requests work both locally and on the AWS server), and find hidden routing errors. I had to dig deep into how Express middleware and network requests actually work to get the frontend and backend to communicate properly.

What I would do differently
If I were to start the project over, I would plan its structure differently from day one. I would strictly separate the code by tasks, plan clean routes before writing any code, and definitely use TypeScript. Strict typing would have helped catch data errors (like wrong Mongoose database keys) while writing the code. This would have saved me hours of hunting for bugs on the backend.