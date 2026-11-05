# System Architecture

## 1. Overview

The project uses a three-service architecture:

1. Nginx — external entry point and reverse proxy.
2. Express API — application server.
3. MongoDB — persistent database.

Docker Compose manages the services and connects them through a private bridge network.

## 2. Architecture Diagram

```text
Windows Host
    |
    | HTTPS :8443
    | HTTP  :8081
    |
    v
+----------------------------+
|       Nginx Container      |
|       Ports 80 / 443       |
|                            |
| TLS termination            |
| HTTP -> HTTPS redirect     |
| Reverse proxy              |
+----------------------------+
              |
              | HTTP :3000
              | Docker DNS: api
              v
+----------------------------+
|       Express API          |
|       Port 3000            |
|                            |
| Request handling           |
| Health endpoints           |
| Database connection        |
+----------------------------+
              |
              | MongoDB protocol :27017
              | Docker DNS: mongo
              v
+----------------------------+
|       MongoDB              |
|       Port 27017           |
|                            |
| Authentication             |
| Database storage           |
+----------------------------+
              |
              v
       Docker Volume
          mongo_data


3. Docker Network
All three containers are connected to the Compose network named:

network-lab_app-network

The network uses Docker's bridge driver.

The bridge network allows containers to communicate privately without publishing every service port to the Windows host.
Service discovery
Docker provides internal DNS resolution for Compose service names.
Service name    Destination
nginx    Nginx container
api    Express API container
mongo    MongoDB container

For example, the API connects to MongoDB using:
mongodb://USERNAME:PASSWORD@mongo:27017/network_lab?authSource=admin


Nginx forwards requests to:
http://api:3000


Service names are preferred over container IP addresses because Docker may assign different IP addresses after container recreation.
4. Port Exposure
Service    Container port    Host mapping
Nginx HTTP    80    127.0.0.1:8081
Nginx HTTPS    443    127.0.0.1:8443
Express API    3000    Not published
MongoDB    27017    Not published

The API uses Docker's internal expose configuration. MongoDB is reachable by other containers on the private network.

Neither API nor MongoDB has a published host port.

Binding Nginx to 127.0.0.1 means the published ports are intended for local-machine access, rather than direct access from other machines on the network.
5. Request Lifecycle
When a client requests:
https://localhost:8443/health


The following steps occur:
1. The client resolves localhost.
2. The client establishes a TCP connection to the Windows host on port 8443.
3. A TLS handshake takes place between the client and Nginx.
4. Nginx presents its locally generated certificate.
5. The client sends its HTTPS request.
6. Nginx forwards the request to http://api:3000.
7. Docker DNS resolves api to the Express container.
8. Express processes the request.
9. Express sends a response to Nginx.
10. Nginx returns the response to the client over the TLS connection.
TLS terminates at Nginx. The Nginx-to-API connection uses HTTP over the private Docker bridge network.
6. HTTP to HTTPS Redirection
The Nginx HTTP server listens on container port 80.

It responds with a permanent redirect:
return 301 https://$host:8443$request_uri;


The HTTPS server listens on container port 443 and uses:
ssl_protocols TLSv1.2 TLSv1.3;


The certificate and private key are mounted into the Nginx container from:
nginx/certs/localhost.pem
nginx/certs/localhost-key.pem


These files are generated locally and must not be committed.
7. Database Connectivity
MongoDB uses environment variables for its root username and password.

The database data directory is persisted through:
volumes:
  - mongo_data:/data/db


This means database data can survive container replacement.

The API connection URI uses the Docker service name mongo, not localhost.

The Compose health check uses mongosh to verify MongoDB availability. The API service depends on MongoDB reporting a healthy status.
8. Security Design
The project applies several basic security measures:
- MongoDB credentials are supplied through environment variables.
- The .env file is excluded from Git.
- TLS private keys and certificates are excluded from Git.
- Nginx is the only service with published ports.
- The API and database are not directly exposed on Windows host ports.
- Nginx configuration and certificate directories are mounted read-only.
- The backend container uses a non-root user.
- Helmet adds HTTP security headers.
- Express trusts the controlled reverse proxy for forwarded request information.
These measures are useful for a local lab but do not constitute a complete production security architecture.
9. Important Design Limitation
The internal connection from Nginx to Express uses HTTP rather than HTTPS.

This is acceptable for this isolated local Docker lab, but a production architecture may require additional controls such as encrypted internal communication, network segmentation, stronger secret management, monitoring, and hardened host configuration.
10. Useful Inspection Commands
docker compose ps
docker network ls
docker network inspect network-lab_app-network
docker volume ls
docker compose logs -f


Inspect container addresses:
docker inspect network-lab-api
docker inspect network-lab-mongo
docker inspect network-lab-nginx


Inspect published ports:
docker port network-lab-nginx
docker port network-lab-api
docker port network-lab-mongo


