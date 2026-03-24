### Google OAuth Setup Guide

To enable Google Authentication in this project, follow these steps:

#### 1. Create a Project on Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `online-vehicle-rental-system`).
3. Search for **"APIs & Services"** in the search bar and select **"Credentials"**.
4. Click **"Configure Consent Screen"**.
   - Select **"External"** as the User Type and click **"Create"**.
   - Fill in the required fields: **App Name**, **User support email**, and **Developer contact information**.
   - In the **Scopes** section, add `openid`, `email`, and `profile`.
   - Complete the configuration and publish the app (optional, keep in test mode for development).

#### 2. Create OAuth 2.0 Client ID
1. On the **Credentials** page, click **"Create Credentials"** and select **"OAuth client ID"**.
2. Select **"Web application"** as the Application type.
3. Add a name for the client (e.g., `Rental System Web Client`).
4. **Authorized JavaScript origins**:
   - `http://localhost:3000`
5. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback`
6. Click **"Create"**.
7. Note down your **Client ID** and **Client Secret**.

#### 3. Update Environment Variables
Update your `.env` file with the following values:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

#### 4. Project File Structure
- `src/app/api/auth/google/route.ts`: Initiates the Google login.
- `src/app/api/auth/google/callback/route.ts`: Handles the callback and creates/logs in the user.
- `src/app/SearchParamHandler.tsx`: Processes the JWT token on the frontend.
- `src/middleware.ts`: Protects routes using the generated JWT.

#### 5. How to use
The "Login with Google" button in the login/register forms will now correctly redirect you through this flow.
