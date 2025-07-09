# Query Management API Tests

This directory contains API tests for the Query Management Module.

## Test Coverage

The test suite includes 7 comprehensive tests covering:

1. **Get All Queries with Pagination** - Tests the GET /api/queries/list endpoint with pagination parameters
2. **Create New Query** - Tests the POST /api/queries/create endpoint
3. **Get Query by ID** - Tests the GET /api/queries/read/:id endpoint
4. **Update Query Status** - Tests the PATCH /api/queries/update/:id endpoint
5. **Add Note to Query** - Tests the POST /api/queries/:id/notes endpoint
6. **Filter Queries by Status** - Tests the GET /api/queries/list endpoint with status filtering
7. **Delete Note from Query** - Tests the DELETE /api/queries/:id/notes/:noteId endpoint

## Running the Tests

### Prerequisites

1. Start the backend server (`npm run dev` in the backend directory)
2. Ensure you have authentication set up (you'll need a valid auth token)
3. Have at least one customer in the database for query creation

### Using Postman

1. Import the collection file: `query-api-tests.postman_collection.json`
2. Set up environment variables:
   - `baseUrl`: Backend server URL (default: http://localhost:8888)
   - `authToken`: Valid JWT token for authentication
   - `customerId`: Valid customer ID from your database
3. Run the collection in order (tests are designed to run sequentially)

### Test Validations

Each test includes:
- Status code validation (200 for success)
- Response structure validation
- Business logic validation
- Data integrity checks

### Notes

- Tests are designed to run sequentially as later tests depend on data created in earlier tests
- The `queryId` and `noteId` variables are automatically populated during test execution
- All tests require proper authentication headers
- Ensure your database has at least one customer record before running tests

## Environment Setup

Before running tests, make sure:
1. Backend server is running on the configured port
2. Database is connected and populated with necessary seed data
3. Authentication is properly configured
4. CORS is configured to allow requests from test tools

## Test Results

Expected test results:
- All 7 tests should pass with proper setup
- Response times should be reasonable (< 500ms for most operations)
- No console errors or warnings
- Proper error handling for invalid requests