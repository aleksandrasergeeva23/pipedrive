import request from 'supertest';
import { app } from '../src/app'; // Import only app

import http from 'http';

describe('API Endpoints', () => {
  let server: http.Server;

  beforeAll((done) => {
    server = app.listen(3001, done); // Start the server on a different port for testing
  });

  afterAll((done) => {
    server.close(done); // Close the server after all tests are done
  });

  it('GET /deals should return all deals', async () => {
    const response = await request(app).get('/deals');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('POST /deals should create a new deal', async () => {
    const newDeal = {
      title: 'New Amazing Deal',
      org_id: 4
    };
    const response = await request(app)
      .post('/deals')
      .send(newDeal)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Deal was added successfully!');
    expect(response.body).toHaveProperty('dealId');
  });

  it('PUT /deals/:id should update an existing deal', async () => {
    const updatedDeal = {
      title: 'Updated Deal Title'
    };
    const response = await request(app)
      .put('/deals/1')
      .send(updatedDeal)
      .set('Content-Type', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Deal updated successfully!');
    expect(response.body.deal).toHaveProperty('title', 'Updated Deal Title');
  });
});