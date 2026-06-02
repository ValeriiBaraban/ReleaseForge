import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';

const mockFilterCleanCommits = jest.fn();
const mockClassifyCommitsWithAI = jest.fn();

jest.unstable_mockModule('../services/aiService.js', () => ({
  default: mockClassifyCommitsWithAI
}));

jest.unstable_mockModule('../services/commitFilter.js', () => ({
  filterCleanCommits: mockFilterCleanCommits
}));

const generateRouter = (await import('../routes/release.js')).default;
const Project = (await import('../models/Project.js')).default;
const RawCommit = (await import('../models/RawCommit.js')).default;
const Release = (await import('../models/Release.js')).default;

let mongoServer;
const app = express();
const mockUserId = new mongoose.Types.ObjectId();

app.use(express.json());
app.use((req, res, next) => {
  req.user = { _id: mockUserId };
  req.isAuthenticated = () => true; 
  next();
});

app.use('/', generateRouter);

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
  await RawCommit.deleteMany({});
  await Release.deleteMany({});
  jest.clearAllMocks();
});

describe('Generator Routes', () => {
  let testProject;

  beforeEach(async () => {
    testProject = await Project.create({ 
      userId: mockUserId, 
      name: 'AI Project',
      repoUrl: 'https://github.com/test/ai-repo'
    });
  });

  describe('POST /generate', () => {
    it('returns 400 if required fields are missing', async () => {
      const res = await request(app).post('/generate').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Project ID, title and version are required');
    });

    it('returns 404 if project is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/generate')
        .send({ projectId: fakeId, version: '1.0.0', title: 'Test' });
      expect(res.statusCode).toBe(404);
    });

    it('returns 400 if no clean commits are found', async () => {
      mockFilterCleanCommits.mockReturnValue([]);
      
      const res = await request(app)
        .post('/generate')
        .send({ projectId: testProject._id, version: '1.0.0', title: 'Test' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('No clean commits found to process for this release');
    });

    it('returns 500 if AI returns empty result', async () => {
      mockFilterCleanCommits.mockReturnValue([{ _id: 'fake', sha: '123' }]);
      mockClassifyCommitsWithAI.mockResolvedValue([]);
      
      const res = await request(app)
        .post('/generate')
        .send({ projectId: testProject._id, version: '1.0.0', title: 'Test' });
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('AI returned empty result');
    });

    it('successfully generates and saves a release (201)', async () => {
      const mockCommits = [
        { _id: new mongoose.Types.ObjectId(), sha: 'abc1234' },
        { _id: new mongoose.Types.ObjectId(), sha: 'def5678' }
      ];
      mockFilterCleanCommits.mockReturnValue(mockCommits);
      
      mockClassifyCommitsWithAI.mockResolvedValue([
        { category: 'Feature', cleanText: 'Added login', hash: 'abc1234' },
        { category: 'Fix', cleanText: 'Fixed crash', hash: 'def5678' },
        { category: 'Chore', cleanText: 'Updated docs', hash: 'ghi9012' }
      ]);

      const res = await request(app)
        .post('/generate')
        .send({ projectId: testProject._id, version: '1.0.0', title: 'Initial Release' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Initial Release');
      expect(res.body.content).toContain('### new function');
      expect(res.body.content).toContain('### bug fixes');
      expect(res.body.content).toContain('### maintenance');
    });

    it('returns 500 on server error', async () => {
      const res = await request(app)
        .post('/generate')
        .send({ projectId: 'invalid-id-format', version: '1.0', title: 'Err' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /:projectId/stats', () => {
    it('returns 0 stats if no releases exist', async () => {
      const res = await request(app).get(`/${testProject._id}/stats`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ totalReleases: 0, totalCommitUsed: 0 });
    });

    it('returns calculated stats when releases exist', async () => {
      await Release.create({
        projectId: testProject._id,
        version: '1.0.0',
        title: 'V1',
        changelogMarkdown: 'text',
        includedCommits: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
      });

      const res = await request(app).get(`/${testProject._id}/stats`);
      expect(res.statusCode).toBe(200);
      expect(res.body.totalReleases).toBe(1);
      expect(res.body.totalCommitUsed).toBe(2);
    });

    it('returns 500 on invalid project ID', async () => {
      const res = await request(app).get('/invalid-id/stats');
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /:projectId', () => {
    it('fetches a list of releases for a project', async () => {
      await Release.create({
        projectId: testProject._id,
        version: '1.0.0',
        title: 'Test',
        changelogMarkdown: 'text'
      });

      const res = await request(app).get(`/${testProject._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('returns 500 on invalid project ID', async () => {
      const res = await request(app).get('/invalid-id');
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /release/:releaseId', () => {
    it('returns 404 if release is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/release/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });

    it('fetches specific release details', async () => {
      const release = await Release.create({
        projectId: testProject._id,
        version: '2.0.0',
        title: 'Test',
        changelogMarkdown: 'text'
      });

      const res = await request(app).get(`/release/${release._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.version).toBe('2.0.0');
    });

    it('returns 500 on invalid release ID', async () => {
      const res = await request(app).get('/release/invalid-id');
      expect(res.statusCode).toBe(500);
    });
  });
});