# ReleaseForge 🛠️
**Automated Changelog Builder**

![Structure](./source/image.png)

## 📢 Week 8 Update: Project Status (Proof of Concept)

**✅ Work Completed (Project Setup & Framework):**
* **Express Server & Middleware:** Fully functional Express server running, configured with CORS, JSON parsing, and secure proxy trust for deployment.
* **Database Connection:** Successful integration with **MongoDB Atlas** using Mongoose.
* **Authentication Framework:** Implemented a robust OAuth workflow using `passport-github2`. Users can successfully log in via GitHub, and their profiles (along with the necessary `accessToken` for future API calls) are saved directly into the MongoDB database.
* **Session Management:** Configured secure, HTTP-only cookies and integrated `connect-mongo` to store active user sessions persistently in the database.
* **Frontend Scaffolding:** React SPA initialized with React Router. Built a landing/login page and a protected Dashboard component that successfully verifies user sessions with the backend.
* **API Routing Framework:** Modularized routing structure is in place (e.g., `/api/auth`, `/api/commits`), ready for expansion.

**🚧 Work Still Needs to be Done:**
* Complete the remaining Mongoose schemas (`Project`, `Release`, `ChangelogItem`).
* Finish the CRUD API routes for managing projects and generated changelogs.
* Connect the frontend Dashboard to the `/api/commits` route to fetch and display the user's real GitHub commit history.
* Build the interactive UI for parsing and categorizing commits into "Features", "Fixes", etc.
* Final UI styling and production deployment tweaks.

---

ReleaseForge is a productivity tool tailored for software development teams, independent developers, and product managers. It focuses on the product release lifecycle by streamlining the creation of clean, professional release notes and changelogs.

---

## 🛑 Problem Statement

Writing release notes is a tedious task that developers often neglect. Raw Git commit messages are usually too technical or messy for end-users or stakeholders to read. 

Translating these commits into a structured, user-friendly changelog (categorized by *New Features*, *Bug Fixes*, and *Improvements*) takes manual effort and time. ReleaseForge solves this by providing a dedicated workspace to import commit data, easily categorize updates, and generate beautifully formatted release pages.

---

## ⚙️ Technical Components

The application is built using the **MERN stack** (MongoDB, Express, React, Node.js) and provisioned using **Terraform** on Railway and MongoDB Atlas.

### 🌐 External Data Source (API)
Integration with the **GitHub REST API**. The backend fetches recent commit messages from public repositories to automatically populate draft release notes, saving users from typing everything from scratch.

### 🗄️ Data Models (MongoDB/Mongoose)
* **User:** Manages authentication and user accounts.
* **Project:** Represents a software product or repository (e.g., "My React App").
* **Release:** Belongs to a Project (e.g., "v1.2.0") and contains publishing dates and statuses (Draft/Published).
* **ChangelogItem:** Individual update entries associated with a Release, including the text and category type (Feature, Fix, Chore).

## 🛣️ API Routes (Express.js)

| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/login` | `POST` | User authentication and session creation. |
| `/api/auth/register` | `POST` | New user registration. |
| `/api/projects` | `GET` / `POST` | Get a list of user projects or create a new project. |
| `/api/projects/:projectId/releases` | `GET` / `POST` | Get all releases for a specific project or create a new one. |
| `/api/releases/:releaseId` | `GET` / `PUT` / `DELETE` | Read, update, or delete a specific release (CRUD operations). |
| `/api/github/commits` | `GET` | Receives a repo URL via query parameter (e.g., `?repo=URL`), securely calls GitHub API, and returns parsed commit data. |

---

## 🎯 Meeting Project Requirements

* **Database Integration:** MongoDB Atlas persistently stores user profiles, projects, and the generated release documents.
* **RESTful API:** The Express backend handles all database operations and securely manages the interaction with the external GitHub API.
* **Frontend Framework:** A React SPA provides a drag-and-drop or interactive categorization interface to sort imported commits into changelog sections.
* **Deployment:** The entire infrastructure (Railway backend/frontend and MongoDB Atlas) is deployed as code using **Terraform**.
* **Value Generation:** The project solves a tangible workflow problem in the software industry, demonstrating a strong understanding of developer tooling.

---

## 🗓️ Project Timeline

### **Week 1: Infrastructure & Scaffolding**
- [x] Deploy MongoDB Atlas and Railway environment via Terraform.
- [x] Initialize React frontend and Express backend.
- [x] Set up environment variables and connect the database.

### **Week 2: Database Models & Backend API**
- [x] Build Mongoose schemas (User schema completed, others pending).
- [ ] Develop CRUD routes and test via Postman.
- [x] Implement the GitHub API integration route to fetch commits.

### **Week 3: Frontend Development**
- [x] Build the React UI (Dashboard and Login framework established).
- [x] Connect the frontend to the backend API using Axios/Fetch.
- [ ] Create the logic for parsing and categorizing fetched commits.

### **Week 4: Styling, Export & Final Deployment**
- [ ] Implement final CSS/Tailwind styling for the generated changelog view.
- [ ] Ensure CI/CD pipelines push correctly to the Railway production environment.
- [ ] Final bug fixing, code cleanup, and presentation preparation.