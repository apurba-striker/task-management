# Docker & Deployment Guide

## Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/) installed

## Quick Start
1. Clone the repository and navigate to the project root.
2. Run:
   ```sh
   docker-compose up --build
   ```
3. Access the frontend at [http://localhost:3000](http://localhost:3000)
4. The backend API runs at [http://localhost:5000](http://localhost:5000)

## Notes
- MongoDB data persists in the `mongo-data` Docker volume.
- Uploaded files and logs are persisted in the `backend/uploads` and `backend/logs` directories.
- To stop and remove containers, networks, and volumes:
   ```sh
   docker-compose down -v
   ```