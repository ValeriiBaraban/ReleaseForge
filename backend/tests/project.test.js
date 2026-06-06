import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import projectRouter from '../routes/project.js';
import Project from '../models/Project.js';
import Release from '../models/Release.js';
import ChangeLog from '../models/ChangeLog.js';

let mongoServer;
const app = express();
const mockUserId = new mongoose.Types.ObjectId();

app.use(express.json());
app.use((req, res, next) => {
  req.user = { _id: mockUserId };
  req.isAuthenticated = () => true; 
  next();
});

app.use('/projects', projectRouter);

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
  await Release.deleteMany({});
  await ChangeLog.deleteMany({});
});

describe('Project & Nested Routes (Compact)', () => {
  it('creates, fetches, updates and deletes projects', async () => {
    // Create
    const resPost = await request(app).post('/projects').send({ name: 'App', repoUrl: 'url' });
    expect(resPost.statusCode).toBe(201);
    
    // Fetch
    const resGet = await request(app).get('/projects');
    expect(resGet.body.length).toBe(1);

    // Update
    const pId = resPost.body._id;
    const resPut = await request(app).put(`/projects/${pId}`).send({ name: 'App V2', repoUrl: 'url' });
    expect(resPut.statusCode).toBe(200);

    // Delete
    const resDel = await request(app).delete(`/projects/${pId}`);
    expect(resDel.statusCode).toBe(200);
  });

  it('handles releases within a project', async () => {
    const project = await Project.create({ userId: mockUserId, name: 'P', repoUrl: 'U' });
    
    const resPost = await request(app)
      .post(`/projects/${project._id}/releases`)
      .send({ version: '1', title: 'T', changelogMarkdown: 'M' });
    expect(resPost.statusCode).toBe(201);
    
    const resGet = await request(app).get(`/projects/${project._id}/releases`);
    expect(resGet.body.length).toBe(1);
  });

  it('searches commits within a project', async () => {
    const project = await Project.create({ userId: mockUserId, name: 'P', repoUrl: 'U' });
    const release = await Release.create({ projectId: project._id, version: '1', title: 'T', changelogMarkdown: 'M' });
    await ChangeLog.create({ release: release._id, text: 'fixed bug', category: 'Fix' });
    
    const resSearch = await request(app).get(`/projects/${project._id}/commits/search?q=fix`);
    expect(resSearch.body.results.length).toBe(1);
    expect(resSearch.body.results[0].text).toBe('fixed bug');
  });

  it('handles empty search queries', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/projects/${fakeId}/commits/search`);
    expect(res.body.results).toEqual([]);
  });
});