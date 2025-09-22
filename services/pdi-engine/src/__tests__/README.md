# PDI Engine Test Suite

This directory contains comprehensive tests for the PDI (Personal Debt Index) Engine module.

## Test Structure

### Core Tests
- `calculator.test.ts` - Tests for the PDI calculation engine
- `service.test.ts` - Tests for the main PDI service class
- `routes.test.ts` - Tests for API endpoints and Fastify integration
- `cache.test.ts` - Tests for Redis caching functionality
- `trust-integration.test.ts` - Tests for Trust Engine integration
- `monitoring.test.ts` - Tests for monitoring and analytics

### Configuration
- `setup.ts` - Global test setup and utilities
- `jest.config.js` - Jest configuration (in project root)

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run with verbose output
npm run test:verbose

# Run for CI/CD (no watch mode)
npm run test:ci
```

### Running Specific Tests
```bash
# Run specific test file
npm test calculator.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="calculate"

# Run only changed files (in watch mode)
npm run test:watch -- --onlyChanged
```

## Test Categories

### Unit Tests
- **Calculator Tests**: Validate PDI scoring algorithm, metric calculations, category determination, and DAMOCLES triggers
- **Service Tests**: Database operations, caching integration, alert creation, and rewards calculation
- **Cache Tests**: Redis operations, TTL management, error handling, and connection management
- **Trust Integration Tests**: Context generation, stress indicators, vulnerability assessment, and notification system

### Integration Tests
- **API Tests**: HTTP endpoints, request validation, error handling, and response formatting
- **Monitoring Tests**: Analytics aggregation, real-time dashboard data, and usage reporting

## Test Utilities

The test suite includes global utilities available via `global.testUtils`:

```typescript
// Create mock PDI inputs
const inputs = global.testUtils.createMockPDIInputs({
  monthlyIncome: 6000 // override specific fields
});

// Create mock PDI score
const score = global.testUtils.createMockPDIScore({
  category: 'critical' // override specific fields
});

// Create mock profile
const profile = global.testUtils.createMockProfile({
  currentScore: 45
});

// Add delays in async tests
await global.testUtils.delay(100);
```

## Mocking Strategy

### External Dependencies
- **Prisma Client**: Mocked with jest.mock() to simulate database operations
- **Redis**: Mocked ioredis with in-memory operations
- **Console Output**: Suppressed during tests unless `VERBOSE_TESTS=1`

### Service Dependencies
- **PDI Service**: Mocked in integration tests to isolate components
- **DAMOCLES Trigger Service**: Mocked for monitoring tests
- **Trust Integration**: Mocked where used as dependency

## Coverage Targets

The test suite aims for:
- **Line Coverage**: >90%
- **Function Coverage**: >95%
- **Branch Coverage**: >85%
- **Statement Coverage**: >90%

### Coverage Reports
Coverage reports are generated in multiple formats:
- **Console**: Summary during test runs
- **HTML**: `coverage/lcov-report/index.html` for detailed browsing
- **LCOV**: `coverage/lcov.info` for CI/CD integration

## Testing Best Practices

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should perform expected behavior', () => {
      // Test implementation
    });
  });
});
```

### Mock Management
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clear call history
});

afterEach(() => {
  // Clean up any test state
});
```

### Async Testing
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Error Testing
```typescript
it('should handle errors gracefully', async () => {
  mockService.method.mockRejectedValue(new Error('Test error'));

  const result = await serviceUnderTest.method();

  expect(result).toBeNull(); // or appropriate error handling
});
```

## Test Environment

### Environment Variables
- `VERBOSE_TESTS=1`: Enable console output during tests
- `NODE_ENV=test`: Set automatically by Jest

### Database
Tests use mocked Prisma client - no real database required.

### Redis
Tests use mocked ioredis client - no real Redis required.

## Continuous Integration

The test suite is designed for CI/CD environments:

```bash
# CI-friendly test command
npm run test:ci
```

This command:
- Runs all tests once (no watch mode)
- Generates coverage reports
- Exits with proper error codes
- Suppresses unnecessary output

## Debugging Tests

### Visual Studio Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Specific Test
```bash
# Run specific test with debug info
npm test -- --verbose calculator.test.ts
```

## Adding New Tests

### For New Components
1. Create `component-name.test.ts` in appropriate directory
2. Follow existing naming and structure conventions
3. Add to test coverage requirements
4. Update this README if introducing new patterns

### For New Features
1. Add unit tests for core logic
2. Add integration tests for API endpoints
3. Add error handling tests
4. Update mock utilities if needed

## Common Issues

### Mock Issues
- Ensure mocks are cleared between tests
- Verify mock implementation matches real interface
- Use `jest.fn()` for simple mocks, `jest.mock()` for modules

### Async Issues
- Always use `async/await` for async tests
- Don't forget to await async operations
- Use `resolves/rejects` matchers for promise testing

### Coverage Issues
- Check uncovered lines in HTML report
- Add tests for error paths and edge cases
- Verify all exported functions are tested