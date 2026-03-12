# ChatMITS

ChatMITS is a local web application for connecting users via chat and matchmaking. 
This project has recently been migrated to a monorepo structure utilizing a **React-Bootstrap** frontend and a **Spring Boot** JSON API + WebSocket backend. 

## Project Architecture

The repository is structured as a monorepo containing two distinct modules:

* `frontend/`: A React Single Page Application (SPA) built with Vite and React-Bootstrap for dynamic user interfaces.
* `backend/`: A Spring Boot 3 + Java 17 application providing REST endpoints, WebSockets for realtime chat, and MySQL Data JPA persistence.

## Technologies Used

* **Frontend:**
  * React 18
  * Vite
  * TypeScript
  * Bootstrap & React-Bootstrap
  * lucide-react (Icons)
* **Backend:**
  * Java 17+
  * Spring Boot 3 (Web, WebSocket)
  * Spring Data JPA
  * MySQL Connector
* **Database:**
  * MySQL (local instance)

---

## Local Development Setup

### 1. Database Setup (MySQL)
The backend requires a local MySQL instance. 
1. Install and start your MySQL server instance.
2. In your MySQL instance, create a new local database, for example by running: 
   ```sql
   CREATE DATABASE chatmitsdemo;
   ```
3. Update your database configuration (URL, username, and password) inside the `backend/src/main/resources/application.properties` file if your local setup differs from the default `root`/`root`.

### 2. Backend Setup
1. Ensure Java 17+ and Maven (or the Maven Wrapper) are installed.
2. Navigate into the backend directory:
   ```sh
   cd backend
   ```
3. Build and start the Spring Boot application:
   ```sh
   ./mvnw spring-boot:run
   ```
The backend server runs on `http://localhost:8080` by default.

### 3. Frontend Setup
1. Ensure Node.js and npm are installed.
2. Open a new terminal window/tab and navigate into the frontend directory:
   ```sh
   cd frontend
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```
4. Start the frontend development server:
   ```sh
   npm run dev
   ```
The frontend UI will be accessible on `http://localhost:5173` (or the nearest available port allocated by Vite).
