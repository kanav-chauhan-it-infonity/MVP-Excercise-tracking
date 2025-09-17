# Environment Configuration

## API URL Configuration

The application uses environment variables to determine the API endpoint URLs. Follow these steps to configure the API URL:

1. Create a `.env` file in the root of the frontend project:
```
# For local development
REACT_APP_API_URL=http://localhost:8000

# For production
# REACT_APP_API_URL=https://ai.itinfonity.net
```

2. The API endpoint will default to `http://localhost:8000` if the environment variable is not set.

3. To change between environments:
   - For local development: Use `http://localhost:8000`
   - For production: Use `https://ai.itinfonity.net`

4. After changing the `.env` file, restart the development server for the changes to take effect. 