@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: ChatMITS - Google Cloud Automated Deployment Script (Windows)
:: ==============================================================================

:: Configuration - CHANGE THESE TO YOUR GCP DETAILS
set PROJECT_ID=your-gcp-project-id
set REGION=us-central1
set REPO_NAME=chatmits-repo
set DB_INSTANCE=chatmits-db
set DB_NAME=chatmits_db

echo "========================================="
echo "Starting Deployment to Google Cloud Run"
echo "Project: %PROJECT_ID%"
echo "Region: %REGION%"
echo "========================================="

:: 1. Ensure gcloud is logged in and set to the right project
call gcloud config set project %PROJECT_ID%

:: 2. Create Artifact Registry if it doesn't exist
echo "Setting up Artifact Registry..."
call gcloud artifacts repositories create %REPO_NAME% --repository-format=docker --location=%REGION% || true
call gcloud auth configure-docker %REGION%-docker.pkg.dev --quiet

:: 3. Build & Push Backend
echo "Building Backend Container..."
cd backend
call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/backend:latest .
cd ..

:: 4. Build & Push Frontend (ensure you have built vite env vars properly)
echo "Building Frontend Container..."
cd frontend
call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/frontend:latest .
cd ..

:: 5. Deploy Backend to Cloud Run
echo "Deploying Backend to Cloud Run..."
:: NOTE: Cloud Run needs connecting to Cloud SQL if you use MySQL. 
:: Alternatively, you can pass your VpcConnector if using Redis (required for 10k users WebSockets sharing).
call gcloud run deploy chatmits-backend ^
  --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/backend:latest ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --memory 2Gi ^
  --cpu 2 ^
  --min-instances 2 ^
  --max-instances 15 ^
  --set-env-vars=SPRING_DATASOURCE_URL="jdbc:mysql://YOUR_DB_IP:3306/chatmits_db",SPRING_DATASOURCE_USERNAME="root",SPRING_DATASOURCE_PASSWORD="password",SPRING_PROFILES_ACTIVE="prod"

:: Get Backend URL
for /f "delims=" %%i in ('gcloud run services describe chatmits-backend --platform managed --region %REGION% --format="value(status.url)"') do set BACKEND_URL=%%i
echo "Backend deployed at: %BACKEND_URL%"

:: 6. Deploy Frontend to Cloud Run
echo "Deploying Frontend to Cloud Run..."
:: Replace placeholder in frontend build with the backend URL
:: In production, frontend needs to know where backend is, often passed via env or built in.
call gcloud run deploy chatmits-frontend ^
  --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/frontend:latest ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --min-instances 1 ^
  --max-instances 20

echo "========================================="
echo "Deployment Complete!"
echo "Make sure your Frontend points to your Backend URL ($BACKEND_URL)."
echo "For 10k users, ensure you have set up a Redis instance (Memorystore) for WebSocket communication!"
echo "========================================="
pause
