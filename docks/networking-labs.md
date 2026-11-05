# Practical Networking Labs

These experiments use the Docker deployment to explore real networking behavior.

## Lab 1 - Inspect Running Containers

### Objective
Identify the services running in the deployment.

### Commands

```powershell
docker compose ps
docker ps


What to observe
- Three containers should be running.
- MongoDB should report a healthy status.
- Nginx should publish ports 8081 and 8443 to the Windows host.
- API and MongoDB should not have published host ports.
Lab 2 - Inspect Docker Bridge Networking
Objective
Understand how containers connect through a bridge network.
Commands
docker network ls
docker network inspect network-lab_app-network


What to observe
Inspect:
- Network driver.
- Subnet and gateway.
- Connected containers.
- Container IPv4 addresses.
Docker may assign different container addresses after containers are recreated.
Lab 3 - Understand Docker DNS
Objective
Understand how containers discover other containers using service names.

Run:
docker exec network-lab-api node -e "require('dns').lookup('mongo',(e,a)=>{if(e)throw e;console.log(a)})"


Test Nginx name resolution:
docker exec network-lab-api node -e "require('dns').lookup('nginx',(e,a)=>{if(e)throw e;console.log(a)})"


What to observe
The DNS lookup should return the current container address associated with each service name.

Docker service discovery means the application does not need hardcoded database IP addresses.

A Windows host lookup for mongo is not expected to work: Docker's internal service DNS is available to connected containers, not ordinary external DNS clients.
Lab 4 - Test HTTP to HTTPS Redirection
Objective
Understand how a web server redirects unencrypted HTTP requests to HTTPS.
Command
curl.exe -i http://localhost:8081/health


What to observe
Nginx should return a 301 Moved Permanently response with a Location header pointing to the HTTPS address.
Lab 5 - Test HTTPS and TLS
Objective
Verify that the client can establish an HTTPS connection to Nginx.
Command
curl.exe --ssl-no-revoke -i https://localhost:8443/health


What to observe
- Successful HTTP response.
- TLS connection to Nginx.
- API health information.
- Security headers added by the backend.
--ssl-no-revoke is a curl/Windows Schannel troubleshooting option for revocation-check failures. It should not be treated as a general TLS security setting.
Lab 6 - Test Database Connectivity
Objective
Verify communication between Express and MongoDB.
Command
curl.exe --ssl-no-revoke -i https://localhost:8443/api/db-health


What to observe
A successful response should report that MongoDB is connected.

You can also inspect the API logs:
docker compose logs api


Lab 7 - Verify That Internal Ports Are Not Published
Objective
Understand the difference between a container port and a published host port.
Commands
docker port network-lab-nginx
docker port network-lab-api
docker port network-lab-mongo


Expected behavior
- Nginx should show host mappings for ports 80 and 443.
- API should show no published host port.
- MongoDB should show no published host port.
You can also test the API port from Windows:
Test-NetConnection localhost -Port 3000


The connection should fail because the API port is not published to the Windows host.

This does not mean that the API is unavailable to Nginx. It is reachable through the private Docker network.
Lab 8 - Inspect the TCP Three-Way Handshake
Objective
Understand how TCP establishes a connection.
Procedure
1. Open Wireshark.
2. Select the appropriate Windows loopback capture interface.
3. Start capturing packets.
4. Generate a request:
curl.exe --ssl-no-revoke https://localhost:8443/health


5. Stop the capture.
6. Apply this display filter:
tcp.port == 8443


What to observe
The TCP connection begins with:
1. SYN - client requests a connection.
2. SYN-ACK - server acknowledges and responds.
3. ACK - client acknowledges the response.
This is the TCP three-way handshake.
Lab 9 - Inspect the TLS Handshake
Objective
Understand the TLS negotiation between the client and Nginx.
Procedure
1. Start a Wireshark capture on the loopback interface.
2. Request the HTTPS endpoint.
3. Stop the capture.
4. Apply:
tls.handshake


What to observe
Depending on the negotiated TLS version and packet visibility, inspect:
- Client Hello.
- Server Hello.
- Certificate information.
- Negotiated cipher suite.
- Application Data.
The TLS handshake establishes cryptographic parameters before protected application communication.
Lab 10 - Inspect the Local TLS Certificate
Objective
Understand certificate identity and trust.
Certificate paths
nginx/certs/localhost.pem
nginx/certs/localhost-key.pem


The certificate is generated using mkcert for:
- localhost
- 127.0.0.1
- ::1
What to observe
Inspect the certificate in your browser or using OpenSSL if installed.

Look for:
- Issuer.
- Subject.
- Subject Alternative Names (SAN).
- Validity period.
- Public key information.
The certificate is issued by a local development CA installed on the development machine. It is not a publicly trusted production certificate.
Lab 11 - Inspect Persistent Storage
Objective
Understand the role of Docker volumes.
Commands
docker volume ls
docker volume inspect network-lab_mongo_data


Restart the containers:
docker compose down
docker compose up -d


Check database connectivity again:
curl.exe --ssl-no-revoke https://localhost:8443/api/db-health


The named volume preserves database files when containers are removed without removing the volume.

Warning: The following command removes the Compose volume and its stored database data:
docker compose down -v


Lab 12 - Inspect Request and Proxy Information
Objective
Understand how Nginx forwards requests and how Express sees proxy information.
Command
curl.exe --ssl-no-revoke -i https://localhost:8443/api/request-info


What to observe
The endpoint reports request information such as:
- Client IP as seen by the backend.
- Request protocol.
- Whether Express considers the request secure.
- Host information.
The backend uses Express proxy trust configuration to interpret forwarded request information from Nginx.
Troubleshooting
Containers are not starting
docker compose ps
docker compose logs


MongoDB is unhealthy
docker compose logs mongo


Check the credentials in your local .env file.
Nginx cannot load its certificate
Check that both local certificate files exist:
Get-ChildItem nginx/certs


Verify that the filenames match nginx/default.conf.
HTTPS request fails
Check:
docker compose ps
docker compose logs nginx
docker compose logs api


Docker DNS lookup fails
Verify that all services are attached to the same Compose network:
docker network inspect network-lab_app-network


Learning Summary
These experiments demonstrate practical concepts from:
- TCP/IP.
- TCP connection establishment.
- DNS and service discovery.
- Private bridge networking.
- Port publishing and isolation.
- HTTP and HTTPS.
- TLS handshakes and certificates.
- Reverse proxies.
- Persistent storage.
- Packet capture and analysis.
