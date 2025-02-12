# Max Cube Control Center

## Introduction
The Max Cube Control Center allows you to control your Max Cube devices from a modern user interface. Follow the guide below to set up the project quickly.

## Preview
![Project Preview](preview.jpeg)

## Requirements
- Docker
- Docker Compose

## Setup Instructions
1. Ensure you have Docker and Docker Compose installed.
2. Use the provided docker-compose.yml file.
3. Run `docker compose up -d` to start the services.

## Sample docker-compose.yml
Below is the configuration used for this project:

```dockercompose
services:
  backend:
    image: ghcr.io/m1kx/max-cube-backend:latest
    environment:
      - CUBE_IP_ADDRESS=192.168.0.153    // update with your Max Cube IP
      - APIKEY=secretpassword
    volumes:
      - ./data:/app/data
  frontend:
    image: ghcr.io/m1kx/max-cube-frontend:latest
    ports:
      - "3000:3000"
```

Make sure to update `APIKEY` with a secure password and `CUBE_IP_ADDRESS` with the IP address of your Max Cube.

When everything works, you should now be able to open the host IP on port 3000 in your browser 🎉