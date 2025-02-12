# Max Cube Control Center

## Introduction
The Max Cube Control Center allows you to control your Max Cube devices from a modern user interface. Follow the guide below to set up the project quickly.

## Features
- Set device temperatures
- Schedule temperature changes using cron-jobs (! crons are specified using UTC time zone, so adjust them accordingly)
- Control via iOS Shortcuts [more here](#extra)

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
      - CUBE_IP_ADDRESS=192.168.0.153 # update with your Max Cube IP
      - APIKEY=secretpassword
    volumes:
      - ./data:/app/data
  frontend:
    image: ghcr.io/m1kx/max-cube-frontend:latest
    ports:
      - "3000:3000"
```

Make sure to update `APIKEY` with a secure password and `CUBE_IP_ADDRESS` with the IP address of your Max Cube.

## Additional Notes
- Cron jobs are specified using UTC time. Adjust the schedule accordingly.
- Once the services are running, open your browser at http://localhost:3000 (or replace "localhost" with your host IP) to access the control center.

When everything works, you should be able to control your devices with ease 🎉

## Extra

With the API in combination with iOS Shortcuts, you can quickly turn on/off the heaters. You can even create automations that trigger when you leave your place to automatically turn off the heat.

For that, you would have to adjust the opened backend ports in docker-compose.yml like following and setup port-forwarding on your router:
> Note: Exposing backend ports publicly may require additional security measures.

```dockercompose
services:
  backend:
    image: ghcr.io/m1kx/max-cube-backend:latest
    environment:
      - CUBE_IP_ADDRESS=192.168.0.153 # update with your Max Cube IP
      - APIKEY=secretpassword
    volumes:
      - ./data:/app/data
    ports:
      - "8080:8080"
  frontend:
    image: ghcr.io/m1kx/max-cube-frontend:latest
    ports:
      - "3000:3000"
```

Example Shortcuts:

Turn On:

https://www.icloud.com/shortcuts/9be5d8d536154994ae63801c2d2c6b87

Turn Off:

https://www.icloud.com/shortcuts/4f47b2e9865a4bc5817cf9be01649070
