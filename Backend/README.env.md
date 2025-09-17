# Backend Environment Configuration

## API URL Configuration

The backend can also use environment variables to determine the API URLs and port settings. This makes it easier to deploy to different environments.

1. Create a `.env` file in the root of the backend project:
```
# Base URL for API
API_URL=http://localhost:8000

# Port to run the server on
PORT=8000

# For production
# API_URL=https://ai.itinfonity.net
# PORT=8000
```

2. In a production environment, you can set the environment variables through your hosting platform instead of using a .env file.

## Using with Frontend

The frontend and backend must use matching API URLs. Make sure that:
- If frontend uses `REACT_APP_API_URL=http://localhost:8000`, backend should run on port 8000
- If frontend uses `REACT_APP_API_URL=https://ai.itinfonity.net`, backend should be configured to serve from that domain

After changing the environment configuration, restart the backend server for the changes to take effect. 