import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import projectRouter from '../routes/project.js';
import Project from '../models/Project.js';

let mongoServer;
const app = express();
const mockUserId = new mongoose.Types.ObjectId();

app.use(express.json());
app.use((req, res, next) => {
  req.user = { _id: mockUserId };
  req.isAuthenticated = () => true; 
  next();
});

app.use('/', projectRouter);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Project.deleteMany({});
});

describe('Project Routes CRUD', () => {
  
  it('POST /projects - successfully creates a new project (201)', async () => {
    const res = await request(app)
      .post('/projects')
      .send({
        name: 'ReleaseForge Web',
        description: 'Frontend app',
        repoUrl: 'https://github.com/user/repo'
      });
      
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('ReleaseForge Web');
  });

  it('GET /projects - fetches user projects (200)', async () => {
    await Project.create({ 
      userId: mockUserId, 
      name: 'Test Get Project',
      repoUrl: 'https://github.com/user/get-repo'
    });

    const res = await request(app).get('/projects');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Test Get Project');
  });

  it('PUT /projects/:projectId - updates an existing project (200)', async () => {
    const project = await Project.create({ 
      userId: mockUserId, 
      name: 'Old Name',
      repoUrl: 'https://github.com/user/old-repo'
    });

    const res = await request(app)
      .put(`/projects/${project._id}`)
      .send({ name: 'New Name', repoUrl: 'https://github.com/user/old-repo' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('New Name');
  });

  it('PUT /projects/:projectId - returns 404 if project not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/projects/${fakeId}`)
      .send({ name: 'Ghost Project' });
      
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /projects/:projectId - deletes a project (200)', async () => {
    const project = await Project.create({ 
      userId: mockUserId, 
      name: 'To Delete',
      repoUrl: 'https://github.com/user/del-repo'
    });

    const res = await request(app).delete(`/projects/${project._id}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Project deleted successfully');
  });

  it('DELETE /projects/:projectId - triggers 500 error on invalid ID format', async () => {
    const res = await request(app).delete('/projects/invalid-id');
    expect(res.statusCode).toBe(500);
  });
});