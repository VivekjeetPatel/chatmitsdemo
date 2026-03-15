@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: ChatMITS - Local MySQL to Google Cloud SQL Migration Script
:: ==============================================================================

set PROJECT_ID=chatmits
set REGION=us-central1
set INSTANCE_NAME=chatmits-db
set ROOT_PASSWORD=your_secure_password123
set DB_NAME=chatmits_db

echo ==============================================================
echo Step 1: Exporting your local MySQL database (Requires mysqldump)
echo Ensure MySQL is running locally!
echo ==============================================================
:: Run this if MySQL is accessible via CLI - if it prompts for a password, enter 'vivek7389' (your local pass)
call mysqldump -u root -p chatmits_db > chatmits_db_backup.sql

echo.
echo ==============================================================
echo Step 2: Creating a Google Cloud SQL MySQL Instance
echo This step takes about 5-10 minutes...
echo ==============================================================
call gcloud sql instances create %INSTANCE_NAME% --database-version=MYSQL_8_0 --cpu=2 --memory=7680MB --region=%REGION% --root-password="%ROOT_PASSWORD%"

echo.
echo ==============================================================
echo Step 3: Getting the Public IP of your new Cloud Database
echo ==============================================================
for /f "delims=" %%i in ('gcloud sql instances describe %INSTANCE_NAME% --format="value(ipAddresses[0].ipAddress)"') do set DB_IP=%%i
echo Your new Cloud Database IP is: %DB_IP%

echo.
echo ==============================================================
echo Step 4: Allowing your local computer to connect to it
echo WARNING: Setting authorized networks to 0.0.0.0/0 allows ANYONE to try and connect!
echo Please change this in the Cloud Console later for better security.
echo ==============================================================
call gcloud sql instances patch %INSTANCE_NAME% --authorized-networks=0.0.0.0/0 --clear-password-validation

echo.
echo ==============================================================
echo Step 5: Creating the `chatmits_db` database on the Cloud SQL instance
echo ==============================================================
call gcloud sql databases create %DB_NAME% --instance=%INSTANCE_NAME%

echo.
echo ==============================================================
echo Step 6: Importing your local DB Backup into Cloud SQL
echo ==============================================================
:: We use the raw mysql command now to push the schema up 
call mysql -u root -p"%ROOT_PASSWORD%" -h %DB_IP% %DB_NAME% < chatmits_db_backup.sql

echo.
echo ==============================================================
echo DONE! MIGRATION COMPLETE.
echo ==============================================================
echo In deploy_backend_gcp.bat, update the environment variable to:
echo SPRING_DATASOURCE_URL="jdbc:mysql://%DB_IP%:3306/%DB_NAME%"
echo SPRING_DATASOURCE_PASSWORD="%ROOT_PASSWORD%"
echo ==============================================================
pause
