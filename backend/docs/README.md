# Goodreads Clone API Documentation

This directory contains the API documentation and testing tools for the Goodreads Clone application.

## Available Tools

1. **API Documentation (Swagger UI)**

   - File: `index.php`
   - Purpose: Interactive documentation of all available API endpoints
   - Usage: Open in browser to browse and understand API structure

2. **API Tester**

   - File: `api-test.php`
   - Purpose: Interactive forms to test API endpoints directly
   - Usage: Open in browser to test API endpoints with form inputs

3. **API Specification**
   - File: `swagger.json`
   - Purpose: OpenAPI 3.0 specification file that describes all API endpoints
   - Usage: Used by Swagger UI to generate documentation

## How to Use

### View API Documentation

1. Start your local server (XAMPP, WAMP, etc.)
2. Navigate to `http://localhost/goodreads-php-backend/backend/docs/index.php`
3. The Swagger UI will display all documented endpoints
4. Click on any endpoint to see details, parameters, and response formats

### Test API Endpoints

1. Navigate to `http://localhost/goodreads-php-backend/backend/docs/api-test.php`
2. Select the endpoint you want to test
3. Fill in the required parameters
4. Click the "Test" button
5. View the API response in real-time

## Adding a New API Endpoint to Documentation

To document a new API endpoint:

1. Edit the `swagger.json` file
2. Add your new endpoint under the "paths" section
3. Follow the OpenAPI 3.0 specification format
4. Optionally, add a testing form in `api-test.php` for the new endpoint

Example path entry for a new endpoint:

```json
"/path/to/endpoint.php": {
  "post": {
    "tags": ["tag_name"],
    "summary": "Short summary of what the endpoint does",
    "description": "Detailed description of the endpoint",
    "requestBody": {
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "property1": {
                "type": "string",
                "description": "Description of property"
              }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Success response description",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "success": {
                  "type": "boolean"
                },
                "message": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Best Practices

1. Keep the documentation up to date as you develop new features
2. Test all endpoints through the API tester before deploying
3. Include all possible response codes and error messages
4. Use descriptive summaries and examples for better understanding
