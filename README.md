# Verde

Welcome to Verde! This project utilizes a decoupled architecture, specifically the "Option 1 Architecture", which consists of:
- A **FastAPI** backend for robust and performant API services.
- A **React** frontend for a dynamic and responsive user interface.
- **Docker Compose** for seamless orchestration of these services.

## Architecture Overview

The system is separated into distinct backend and frontend services. This decoupling allows for independent scaling, development, and deployment of each component. Docker Compose binds these services together, providing an isolated and consistent environment across development, testing, and production.

## Running Locally

To run the Verde application locally, you will need to have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

Follow these steps to get the application up and running:

1. **Clone the repository** (if you haven't already) and navigate to the project root directory:
   ```bash
   cd C:\Users\user\Documents\Verde
   ```

2. **Build and start the containers** using Docker Compose:
   ```bash
   docker-compose up --build
   ```
   *Note: Omit the `--build` flag on subsequent runs if you haven't made changes to the Dockerfiles or dependencies.*

3. **Access the Application**:
   - The **React Frontend** should be accessible at `http://localhost:3000` (or whichever port is mapped in `docker-compose.yml`).
   - The **FastAPI Backend** API documentation (Swagger UI) should be accessible at `http://localhost:8000/docs`.

4. **Stopping the Application**:
   To stop the running containers, press `Ctrl+C` in the terminal where Docker Compose is running, or run the following command in another terminal from the project root:
   ```bash
   docker-compose down
   ```
