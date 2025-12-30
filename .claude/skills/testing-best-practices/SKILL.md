---
name: testing-best-practices
description: Expert knowledge of testing Node.js and Express applications including Jest configuration, Supertest for API testing, unit vs integration vs e2e testing, mocking external APIs, test organization, code coverage, CI/CD integration, and TDD practices. Use when writing tests, setting up testing framework, debugging test failures, or adding test coverage.
---

# Testing Best Practices

This skill provides comprehensive expert knowledge of testing Node.js/Express applications with emphasis on Jest and Supertest, test organization, mocking strategies, and achieving comprehensive test coverage.

## Testing Framework Setup

### Jest Installation and Configuration

**Install dependencies**:
```bash
npm install --save-dev jest supertest @types/jest
```

**package.json configuration**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": [
      "/node_modules/"
    ],
    "testMatch": [
      "**/__tests__/**/*.js",
      "**/?(*.)+(spec|test).js"
    ]
  }
}
```

**jest.config.js (advanced)**:
```javascript
module.exports = {
  // Use Node.js test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.js',
    'routes/**/*.js',
    '!src/index.js', // Exclude entry point
    '!**/node_modules/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Timeout for tests
  testTimeout: 10000
};
```

### Test Directory Structure

**Option 1: Separate test directory**:
```
project/
├── src/
│   ├── server.js
│   ├── routes/
│   │   └── api.js
│   └── utils/
│       └── validators.js
├── test/
│   ├── setup.js
│   ├── server.test.js
│   ├── routes/
│   │   └── api.test.js
│   └── utils/
│       └── validators.test.js
└── package.json
```

**Option 2: Co-located tests**:
```
project/
├── src/
│   ├── server.js
│   ├── server.test.js
│   ├── routes/
│   │   ├── api.js
│   │   └── api.test.js
│   └── utils/
│       ├── validators.js
│       └── validators.test.js
└── package.json
```

**Option 3: __tests__ directories**:
```
project/
├── src/
│   ├── __tests__/
│   │   └── server.test.js
│   ├── server.js
│   ├── routes/
│   │   ├── __tests__/
│   │   │   └── api.test.js
│   │   └── api.js
└── package.json
```

## Testing Express Applications with Supertest

### Basic API Testing

```javascript
const request = require('supertest');
const app = require('../server');

describe('GET /', () => {
  it('should return 200 status', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get('/api/users');
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('should return users array', async () => {
    const response = await request(app).get('/api/users');
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('should create a user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .set('Content-Type', 'application/json')
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(userData.email);
    expect(response.body).not.toHaveProperty('password'); // Don't return password
  });

  it('should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John',
        email: 'invalid-email',
        password: 'SecurePass123!'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/email/i);
  });

  it('should reject weak password', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: '123' // Too short
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/password/i);
  });
});

describe('Authentication', () => {
  let authToken;

  beforeAll(async () => {
    // Create a test user and get token
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!'
      });

    authToken = response.body.token;
  });

  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');
  });

  it('should reject access without token', async () => {
    await request(app)
      .get('/api/profile')
      .expect(401);
  });

  it('should reject invalid token', async () => {
    await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
```

### Testing Proxy Endpoints

```javascript
const request = require('supertest');
const axios = require('axios');
const app = require('../server');

// Mock axios
jest.mock('axios');

describe('POST /api/proxy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should proxy request successfully', async () => {
    const mockData = {
      results: [
        { id: 1, name: 'Result 1' },
        { id: 2, name: 'Result 2' }
      ]
    };

    axios.post.mockResolvedValue({
      data: mockData,
      status: 200
    });

    const response = await request(app)
      .post('/api/proxy')
      .send({ query: 'test' })
      .expect(200);

    expect(response.body).toEqual(mockData);
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      { query: 'test' },
      expect.any(Object)
    );
  });

  it('should handle proxy errors', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Internal Server Error' }
      }
    });

    const response = await request(app)
      .post('/api/proxy')
      .send({ query: 'test' })
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  it('should handle network errors', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    const response = await request(app)
      .post('/api/proxy')
      .send({ query: 'test' })
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  it('should validate request before proxying', async () => {
    const response = await request(app)
      .post('/api/proxy')
      .send({ invalid: 'data' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(axios.post).not.toHaveBeenCalled();
  });
});
```

## Mocking Strategies

### Mocking External APIs

**Mock entire module**:
```javascript
jest.mock('axios');

const axios = require('axios');

describe('External API calls', () => {
  it('should fetch data from external API', async () => {
    const mockData = { data: 'test' };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await fetchExternalData();

    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith('https://api.example.com/data');
  });
});
```

**Mock specific functions**:
```javascript
const userService = require('../services/user');

jest.spyOn(userService, 'findById').mockResolvedValue({
  id: 1,
  name: 'Test User'
});

describe('User routes', () => {
  it('should get user by id', async () => {
    const response = await request(app)
      .get('/api/users/1')
      .expect(200);

    expect(response.body.name).toBe('Test User');
    expect(userService.findById).toHaveBeenCalledWith('1');
  });
});
```

**Manual mocks**:
```javascript
// __mocks__/axios.js
module.exports = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} }))
};
```

### Mocking Database

```javascript
// Mock database module
jest.mock('../db');

const db = require('../db');

describe('Database operations', () => {
  beforeEach(() => {
    db.query.mockClear();
  });

  it('should query users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ];

    db.query.mockResolvedValue({ rows: mockUsers });

    const users = await User.findAll();

    expect(users).toEqual(mockUsers);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM users');
  });

  it('should handle database errors', async () => {
    db.query.mockRejectedValue(new Error('Connection failed'));

    await expect(User.findAll()).rejects.toThrow('Connection failed');
  });
});
```

### Mocking Environment Variables

```javascript
describe('Environment configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use default port when PORT not set', () => {
    delete process.env.PORT;
    const config = require('../config');
    expect(config.port).toBe(3000);
  });

  it('should use PORT from environment', () => {
    process.env.PORT = '8080';
    const config = require('../config');
    expect(config.port).toBe(8080);
  });
});
```

## Unit vs Integration vs E2E Testing

### Unit Tests

**What**: Test individual functions/modules in isolation

**Example**:
```javascript
// validators.js
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password) {
  return password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

module.exports = { isValidEmail, isStrongPassword };

// validators.test.js
const { isValidEmail, isStrongPassword } = require('./validators');

describe('Email validation', () => {
  it('should accept valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should reject email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('should reject email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('Password validation', () => {
  it('should accept strong password', () => {
    expect(isStrongPassword('MyP@ssw0rd123!')).toBe(true);
  });

  it('should reject short password', () => {
    expect(isStrongPassword('Short1!')).toBe(false);
  });

  it('should reject password without uppercase', () => {
    expect(isStrongPassword('myp@ssw0rd123!')).toBe(false);
  });

  it('should reject password without special char', () => {
    expect(isStrongPassword('MyPassword123')).toBe(false);
  });
});
```

### Integration Tests

**What**: Test multiple components working together

**Example**:
```javascript
const request = require('supertest');
const app = require('../server');
const db = require('../db');

describe('User registration flow', () => {
  beforeEach(async () => {
    // Clean database before each test
    await db.query('DELETE FROM users');
  });

  it('should register user and allow login', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      })
      .expect(201);

    expect(registerResponse.body).toHaveProperty('id');

    // Login with registered credentials
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('token');

    // Access protected route with token
    const profileResponse = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(200);

    expect(profileResponse.body.email).toBe('test@example.com');
  });
});
```

### End-to-End (E2E) Tests

**What**: Test complete user workflows from UI to database

**Setup with Puppeteer**:
```bash
npm install --save-dev puppeteer
```

**Example**:
```javascript
const puppeteer = require('puppeteer');

describe('E2E: User registration', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should complete registration flow', async () => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register');

    // Fill out form
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'SecurePass123!');
    await page.type('#confirmPassword', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForNavigation();

    // Verify we're on dashboard
    const url = page.url();
    expect(url).toContain('/dashboard');

    // Verify welcome message
    const welcomeMessage = await page.$eval(
      '.welcome',
      el => el.textContent
    );
    expect(welcomeMessage).toContain('test@example.com');
  });
});
```

## Test Organization

### Describe Blocks

```javascript
describe('User API', () => {
  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Test implementation
    });

    it('should support pagination', async () => {
      // Test implementation
    });

    it('should support filtering', async () => {
      // Test implementation
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      // Test implementation
    });

    it('should reject duplicate email', async () => {
      // Test implementation
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      // Test implementation
    });

    it('should reject unauthorized update', async () => {
      // Test implementation
    });
  });
});
```

### Setup and Teardown

```javascript
describe('Database tests', () => {
  // Runs once before all tests in this describe block
  beforeAll(async () => {
    await db.connect();
  });

  // Runs once after all tests in this describe block
  afterAll(async () => {
    await db.disconnect();
  });

  // Runs before each test in this describe block
  beforeEach(async () => {
    await db.query('DELETE FROM users');
    await db.query('INSERT INTO users (email) VALUES ($1)', ['test@example.com']);
  });

  // Runs after each test in this describe block
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should find user', async () => {
    const user = await User.findByEmail('test@example.com');
    expect(user).toBeTruthy();
  });

  it('should delete user', async () => {
    await User.deleteByEmail('test@example.com');
    const user = await User.findByEmail('test@example.com');
    expect(user).toBeNull();
  });
});
```

### Test Fixtures

```javascript
// test/fixtures/users.js
module.exports = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User'
  },

  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    name: 'Admin User',
    role: 'admin'
  },

  invalidUsers: {
    noEmail: {
      password: 'SecurePass123!',
      name: 'Test User'
    },
    weakPassword: {
      email: 'test@example.com',
      password: '123',
      name: 'Test User'
    }
  }
};

// Usage in tests
const fixtures = require('./fixtures/users');

describe('User creation', () => {
  it('should create valid user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(fixtures.validUser)
      .expect(201);
  });

  it('should reject user without email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(fixtures.invalidUsers.noEmail)
      .expect(400);
  });
});
```

## Async Testing

### Testing Promises

```javascript
describe('Async operations', () => {
  it('should resolve with data', async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
  });

  it('should reject with error', async () => {
    await expect(fetchInvalidData()).rejects.toThrow('Not found');
  });

  // Alternative: using done callback
  it('should fetch data (callback style)', (done) => {
    fetchData()
      .then(data => {
        expect(data).toBeDefined();
        done();
      })
      .catch(done);
  });
});
```

### Testing Callbacks

```javascript
describe('Callback functions', () => {
  it('should call callback with data', (done) => {
    fetchDataWithCallback((err, data) => {
      expect(err).toBeNull();
      expect(data).toBeDefined();
      done();
    });
  });

  it('should call callback with error', (done) => {
    fetchInvalidDataWithCallback((err, data) => {
      expect(err).toBeTruthy();
      expect(data).toBeUndefined();
      done();
    });
  });
});
```

## Code Coverage

### Generating Coverage Reports

```bash
# Run tests with coverage
npm run test:coverage

# Coverage report output
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.5  |   78.3   |   91.2  |   85.1  |
 server.js|   92.3  |   85.7   |   100   |   91.8  |
 routes/  |   78.9  |   71.4   |   83.3  |   79.2  |
----------|---------|----------|---------|---------|
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Exclude entry point
    '!src/**/*.test.js', // Exclude test files
    '!src/**/__tests__/**' // Exclude test directories
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Per-file thresholds
    './src/critical-module.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  coverageReporters: [
    'text',      // Terminal output
    'html',      // HTML report in coverage/
    'lcov',      // For CI tools
    'json'       // Machine-readable
  ]
};
```

### Viewing HTML Coverage Report

```bash
npm run test:coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## Testing Best Practices

### 1. Naming Conventions

```javascript
// GOOD - Descriptive test names
describe('User registration', () => {
  it('should create user with valid email and password', () => {});
  it('should reject registration with duplicate email', () => {});
  it('should hash password before storing', () => {});
});

// BAD - Vague test names
describe('User', () => {
  it('works', () => {});
  it('test 1', () => {});
  it('should not fail', () => {});
});
```

### 2. AAA Pattern (Arrange, Act, Assert)

```javascript
it('should calculate total price with tax', () => {
  // Arrange: Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];
  const taxRate = 0.1;

  // Act: Perform the action
  const total = calculateTotal(items, taxRate);

  // Assert: Verify the result
  expect(total).toBe(38.5); // (10*2 + 5*3) * 1.1
});
```

### 3. Test One Thing

```javascript
// GOOD - Each test checks one behavior
it('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

it('should reject email without domain', () => {
  expect(isValidEmail('test@')).toBe(false);
});

// BAD - Testing multiple things
it('should validate inputs', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
  expect(isValidPassword('pass123')).toBe(false);
  expect(isValidPhone('1234567890')).toBe(true);
});
```

### 4. Avoid Test Interdependence

```javascript
// BAD - Tests depend on each other
let userId;

it('should create user', async () => {
  const response = await createUser();
  userId = response.id; // Other tests depend on this
});

it('should update user', async () => {
  await updateUser(userId); // Fails if previous test fails
});

// GOOD - Each test is independent
describe('User operations', () => {
  let userId;

  beforeEach(async () => {
    const user = await createUser();
    userId = user.id;
  });

  it('should update user', async () => {
    await updateUser(userId);
  });

  it('should delete user', async () => {
    await deleteUser(userId);
  });
});
```

### 5. Use Meaningful Assertions

```javascript
// GOOD - Specific assertions
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('users');
expect(response.body.users).toHaveLength(5);
expect(response.body.users[0]).toMatchObject({
  id: expect.any(Number),
  email: expect.stringMatching(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
});

// BAD - Vague assertions
expect(response).toBeTruthy();
expect(response.body).toBeDefined();
```

### 6. Test Edge Cases

```javascript
describe('Division function', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle zero numerator', () => {
    expect(divide(0, 5)).toBe(0);
  });

  it('should throw error for division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle decimal results', () => {
    expect(divide(5, 2)).toBe(2.5);
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        fail_ci_if_error: true
```

### npm Scripts for CI

```json
{
  "scripts": {
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

## Common Jest Matchers

### Equality

```javascript
expect(value).toBe(4); // Strict equality (===)
expect(value).toEqual({ a: 1 }); // Deep equality
expect(value).not.toBe(5); // Negation
```

### Truthiness

```javascript
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
```

### Numbers

```javascript
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(4.5);
expect(value).toBeCloseTo(0.3); // Floating point
```

### Strings

```javascript
expect(string).toMatch(/pattern/);
expect(string).toMatch('substring');
expect(string).toContain('substring');
```

### Arrays and Iterables

```javascript
expect(array).toContain('item');
expect(array).toHaveLength(3);
expect(array).toEqual(expect.arrayContaining([1, 2]));
```

### Objects

```javascript
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', value);
expect(object).toMatchObject({ a: 1, b: 2 });
expect(object).toEqual(expect.objectContaining({ a: 1 }));
```

### Functions

```javascript
expect(fn).toThrow();
expect(fn).toThrow('error message');
expect(fn).toThrow(Error);
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledTimes(3);
```

## Testing Checklist

### Unit Tests
- [ ] Test pure functions in isolation
- [ ] Test all code paths (happy path and error cases)
- [ ] Test edge cases and boundary conditions
- [ ] Mock external dependencies
- [ ] Achieve high code coverage (>80%)

### Integration Tests
- [ ] Test API endpoints
- [ ] Test authentication/authorization
- [ ] Test database operations
- [ ] Test external API integration
- [ ] Test error handling

### E2E Tests
- [ ] Test critical user flows
- [ ] Test form submissions
- [ ] Test navigation
- [ ] Test authentication flow

### General
- [ ] Tests are fast (< 5 seconds for unit tests)
- [ ] Tests are independent (can run in any order)
- [ ] Tests are repeatable (same result every time)
- [ ] Tests have clear, descriptive names
- [ ] Setup and teardown properly implemented
- [ ] No hardcoded values (use constants/fixtures)
- [ ] CI/CD integration configured

## Example Test Suite for Express API

```javascript
const request = require('supertest');
const app = require('../server');
const db = require('../db');

describe('Express API Tests', () => {
  // Setup: Connect to test database
  beforeAll(async () => {
    await db.connect(process.env.TEST_DATABASE_URL);
  });

  // Cleanup: Disconnect from database
  afterAll(async () => {
    await db.disconnect();
  });

  // Reset database before each test
  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        email: userData.email,
        name: userData.name
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      };

      // Create first user
      await request(app).post('/api/users').send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(409);

      expect(response.body.error).toMatch(/already exists/i);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test'
        })
        .expect(400);

      expect(response.body.error).toMatch(/email/i);
    });

    it('should enforce password requirements', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test'
        })
        .expect(400);

      expect(response.body.error).toMatch(/password/i);
    });
  });

  describe('Authentication', () => {
    let authToken;
    const testUser = {
      email: 'auth@example.com',
      password: 'SecurePass123!',
      name: 'Auth User'
    };

    beforeEach(async () => {
      // Create user
      await request(app).post('/api/users').send(testUser);

      // Login and get token
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = response.body.token;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        })
        .expect(401);
    });

    it('should access protected route with token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    it('should reject access without token', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });
  });
});
```

## Resources

- Jest Documentation: https://jestjs.io/docs/getting-started
- Supertest Documentation: https://github.com/ladjs/supertest
- Testing Best Practices: https://github.com/goldbergyoni/javascript-testing-best-practices
- Kent C. Dodds Testing Library: https://testing-library.com/
- Node.js Testing Best Practices: https://github.com/goldbergyoni/nodebestpractices#6-testing-best-practices
