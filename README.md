# ReleaseForge 🛠️
**Automated Changelog Builder**
Structure:
![Structure](.\source\projectStructure.png)

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

### 🛣️ API Routes (Express.js)
| Route | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/login` | `POST` | User authentication / Login |
| `/api/auth/register` | `POST` | User registration |
| `/api/projects` | `GET/POST` | Manage user projects |
| `/api/releases/:projectId` | `GET/POST` | CRUD operations for version releases |
| `/api/github/commits` | `POST` | Receives a repo URL from the frontend, securely calls the GitHub API from the backend, and returns parsed commit data. |

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
- [ ] Deploy MongoDB Atlas and Railway environment via Terraform.
- [ ] Initialize React frontend and Express backend.
- [ ] Set up environment variables and connect the database.

### **Week 2: Database Models & Backend API**
- [ ] Build Mongoose schemas (User, Project, Release).
- [ ] Develop CRUD routes and test via Postman.
- [ ] Implement the GitHub API integration route to fetch commits.

### **Week 3: Frontend Development**
- [ ] Build the React UI (Dashboard, Project View, Release Editor).
- [ ] Connect the frontend to the backend API using Axios.
- [ ] Create the logic for parsing and categorizing fetched commits.

### **Week 4: Styling, Export & Final Deployment**
- [ ] Implement final CSS/Tailwind styling for the generated changelog view.
- [ ] Ensure CI/CD pipelines push correctly to the Railway production environment.
- [ ] Final bug fixing, code cleanup, and presentation preparation.