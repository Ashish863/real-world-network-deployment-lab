# Real-World Network Deployment Lab

A hands-on, containerized deployment project demonstrating how a backend application, database, reverse proxy, private networking, and HTTPS work together.

This project was built as a practical Computer Networks and deployment lab using Docker, Docker Compose, Node.js, Express, MongoDB, Nginx, and TLS.

## Architecture

```text
                 Windows Host
                      |
             https://localhost:8443
                      |
                Nginx (80/443)
                Reverse Proxy
                      |
              Docker Bridge Network
                      |
                 Express API
                  api:3000
                      |
                   MongoDB
## Architecture

```text
                 Windows Host
                      |
             https://localhost:8443
                      |
                Nginx (80/443)
                Reverse Proxy
                      |
              Docker Bridge Network
                      |
                 Express API
                  api:3000
                      |
                   MongoDB
                  mongo:27017
                      |
                 mongo_data
                Persistent Volume


Main components
Component    Responsibility
Windows host    Runs Docker Desktop and accesses the application
Nginx    Reverse proxy and HTTPS/TLS termination
Express API    Handles HTTP requests and application logic
MongoDB    Stores application data
Docker Compose    Manages containers, networking, and volumes
Docker bridge network    Provides private container-to-container communication

Features
- Containerized Express backend and MongoDB.
- Nginx reverse proxy.
- Local HTTPS using a locally generated TLS certificate.
- HTTP-to-HTTPS redirection.
- Private Docker bridge network.
- Docker service-name DNS resolution.
- MongoDB authentication.
- Persistent MongoDB storage using a Docker volume.
- MongoDB health check and API startup dependency.
- Backend container runs without publishing its port to the Windows host.
- Security headers using Helmet.
- Practical TCP, TLS, DNS, and Docker networking experiments.
Technology Stack
- Node.js
- Express.js
- MongoDB 8
- Docker
- Docker Compose
- Nginx
- mkcert
- Wireshark
- PowerShell
Prerequisites
Install the following on your Windows machine:
1. Docker Desktop with the Docker Compose plugin.
2. Git.
3. mkcert.
4. Node.js is useful for local development, but the application runs inside Docker.
5. Wireshark is optional for packet inspection.
Start Docker Desktop before running the project.
Project Structure
network-lab/
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── dbConnection.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── docks/
│   ├── architecture.md
│   └── networking-labs.md
├── nginx/
│   └── default.conf
├── .env.example
├── .gitignore
└── docker-compose.yml


The nginx/certs/ directory is generated locally and is intentionally excluded from Git.
Setup and Installation
1. Clone the repository
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd network-lab


2. Create your environment file
Copy-Item .env.example .env


Open .env and replace the example password with a strong local password.

Do not commit .env or share its credentials.
3. Generate a local TLS certificate
Install mkcert and run:
mkcert -install


Create the certificate directory:
New-Item -ItemType Directory -Force nginx/certs


Generate the certificate and private key:
mkcert -key-file nginx/certs/localhost-key.pem -cert-file nginx/certs/localhost.pem localhost 127.0.0.1 ::1


The filenames must match the paths configured in nginx/default.conf.

The certificate is intended for local development. It is not a publicly trusted production certificate.
4. Build and start the containers
docker compose up --build -d


5. Check container status
docker compose ps


Wait until MongoDB reports a healthy status.
6. View container logs
docker compose logs


For individual services:
docker compose logs api
docker compose logs mongo
docker compose logs nginx


Access the Application
The application is bound to the local machine only.
Address    Purpose
http://localhost:8081    Redirects to HTTPS
https://localhost:8443    Main HTTPS entry point
https://localhost:8443/health    API health check
https://localhost:8443/api/db-health    Database connectivity check
https://localhost:8443/api/request-info    Request and proxy information

If using Windows PowerShell with curl and encountering a Schannel certificate revocation-check issue, test with:
curl.exe --ssl-no-revoke -i https://localhost:8443/health


This option disables revocation checking for that curl invocation only. It is not a replacement for proper certificate validation.
Network Design
The containers communicate through a Docker user-defined bridge network.
Service    Internal port    Published to Windows host?
Nginx    80, 443    Yes, bound to 127.0.0.1
Express API    3000    No
MongoDB    27017    No

Docker Compose service names provide internal DNS resolution:
- api resolves to the API container.
- mongo resolves to the MongoDB container.
- Nginx forwards requests to http://api:3000.
The actual container IP addresses are assigned by Docker and may change when containers are recreated. Use service names rather than hardcoded container IPs.
Useful Docker Commands
# Start services
docker compose up -d

# Rebuild and start
docker compose up --build -d

# Stop services
docker compose down

# Stop services and remove containers
docker compose down

# View running containers
docker compose ps

# Follow logs
docker compose logs -f

# Inspect Docker networks
docker network ls

# Inspect the project network
docker network inspect network-lab_app-network

# Inspect persistent volumes
docker volume ls


To remove the database volume and its stored data, use:
docker compose down -v


Warning: This permanently removes the MongoDB data stored in the Compose volume.
Practical Learning Outcomes
This project provides practical experience with:
- TCP/IP communication.
- Docker bridge networking.
- Container isolation.
- DNS resolution inside Docker.
- Reverse proxy architecture.
- HTTP and HTTPS.
- TLS certificates and encryption.
- TCP connection establishment.
- Packet capture and analysis with Wireshark.
- Database connectivity and persistent storage.
- Basic application deployment security.
See Architecture Documentation and Networking Labs for more detail.
Security Notes
- Never commit .env files or real credentials.
- Never commit TLS private keys or local certificates.
- API and database ports are not published to the Windows host.
- Nginx is the only published entry point.
- Local TLS certificates are not suitable for public production deployment.
- Use properly managed secrets, production certificates, firewall rules, and hardened configurations before deploying a public service.
Project Scope
This is a local real-world deployment and networking lab. It demonstrates deployment architecture and network behavior on a development machine; it is not a publicly hosted production service.
License
Add a license if you intend to distribute or reuse this project under an open-source license.
