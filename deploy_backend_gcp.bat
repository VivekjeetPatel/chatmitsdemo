@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: ChatMITS - Backend Google Cloud Automated Deployment Script
:: ==============================================================================

set PROJECT_ID=chatmits
set REGION=us-central1
set REPO_NAME=chatmits-repo

echo "========================================="
echo "Starting Backend Deployment to Google Cloud Run"
echo "Project: %PROJECT_ID%"
echo "========================================="

:: 1. Enable needed APIs (only necessary once)
echo "Enabling Cloud Run, Artifact Registry, and Cloud Build APIs..."
call gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

:: 2. Create Artifact Registry if it doesn't exist
echo "Setting up Artifact Registry..."
call gcloud artifacts repositories create %REPO_NAME% --repository-format=docker --location=%REGION% || true
call gcloud auth configure-docker %REGION%-docker.pkg.dev --quiet

:: 3. Build & Push Backend using Cloud Build
echo "Building Backend Container in the Cloud..."
cd backend
call gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/backend:latest .
cd ..

:: 4. Deploy Backend to Cloud Run
echo "Deploying Backend to Cloud Run..."
call gcloud run deploy chatmits-backend ^
  --image %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/backend:latest ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --memory 2Gi ^
  --cpu 2 ^
  --min-instances 1 ^
  --max-instances 15 ^
  --set-env-vars=SPRING_DATASOURCE_URL="jdbc:mysql://34.27.216.84:3306/chatmits_db",SPRING_DATASOURCE_USERNAME="root",SPRING_DATASOURCE_PASSWORD="SuperSecretPassword123!",SPRING_PROFILES_ACTIVE="prod"

:: Output the URL
for /f "delims=" %%i in ('gcloud run services describe chatmits-backend --platform managed --region %REGION% --format="value(status.url)"') do set BACKEND_URL=%%i
echo "Backend successfully deployed at: !BACKEND_URL!"

pause
