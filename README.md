```markdown
# Pipedrive API Integration

This project is an API integration with Pipedrive, providing endpoints to manage deals. It includes functionalities for continuous integration (CI), continuous deployment (CD), and ensures reproducibility with Docker.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Running Locally](#running-locally)
   - [Using Docker](#using-docker)
   - [Without Docker](#without-docker)
3. [Endpoints](#endpoints)
4. [CI/CD](#cicd)
   - [Continuous Integration](#continuous-integration)
   - [Continuous Deployment](#continuous-deployment)
5. [Reproducibility](#reproducibility)
6. [Tests](#tests)

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- Docker (for containerization)
- GitHub account (for CI/CD setup)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aleksandrasergeeva23/pipedrive.git
   cd pipedrive
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

### Using Docker

1. **Build the Docker image**:
   ```bash
   docker build -t pipedrive .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 3000:3000 pipedrive
   ```

3. The application will be accessible at `http://localhost:3000`.

### Without Docker

1. **Set up environment variables**:
   Create a `.env` file in the root of your project and add the following:
   ```
   API_TOKEN=your_pipedrive_api_token
   COMPANY_DOMAIN=your_company_domain
   ```

2. **Run the application**:
   ```bash
   npm start
   ```

3. The application will be accessible at `http://localhost:3000`.

## Endpoints

- `GET /deals`: Fetch all deals.
- `POST /deals`: Create a new deal.
- `PUT /deals/:id`: Update an existing deal.
- `GET /metrics`: Fetch request metrics.

## CI/CD

### Continuous Integration

GitHub Actions is used for continuous integration. The workflow runs tests and linting on every commit pushed to a pull request.

#### Workflow Configuration

`.github/workflows/ci.yml`:
```yaml
name: Node.js CI

on:
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x]

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: Install dependencies
      run: npm ci
    - name: Run linting
      run: npm run lint
    - name: Run tests
      run: npm test
```

### Continuous Deployment

GitHub Actions is used for continuous deployment. The workflow logs "Deployed!" when a pull request is merged to the `master` branch.

#### Workflow Configuration

`.github/workflows/cd.yml`:
```yaml
name: CD Workflow

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Log deployment message
      run: echo "Deployed!"
```

## Reproducibility

To ensure reproducibility, the project uses Docker and a `package-lock.json` file to lock dependencies.

### Dockerfile

```Dockerfile
# Use Node.js LTS version as the base image
FROM node:lts

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
```

### Docker Compose

If you have additional services or want to simplify Docker commands, create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
```

### Running with Docker Compose

```bash
docker-compose up --build
```

## Tests

### Running Tests

To run the tests, use the following command:
```bash
npm test
```

### Test Configuration

Tests are configured using Jest and Supertest. The tests cover the `GET`, `POST`, and `PUT` endpoints.

#### Example Test (`tests/app.test.ts`)

```typescript
import request from 'supertest';
import { app } from '../src/app'; // Adjust the path as necessary
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
```

## Summary

This project integrates with the Pipedrive API to manage deals. It includes comprehensive CI/CD pipelines using GitHub Actions, ensures reproducibility with Docker, and provides clear instructions for running the application locally and in a containerized environment.
```
