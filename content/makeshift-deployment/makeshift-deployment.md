---
title: The makeshift continuous deployment guide
icon: construction
category: posts
date: 2025-06-09
---

Getting your hobby projects up and running for your friends to use should be simple, resilient and cheap. Unfortunately today we have to navigate a jungle of platforms and providers.

From edge computing to distrubuted databases, everyone tries to convince you that there is no way around this and that you must shell out and empty your wallet for your apps to be deployed.

For years I wondered if it would be possible to deploy apps like they did in the good old days. But my skill was lacking. Over time, I built up enough courage and frustration to tackle this problem.

In this post, I aim to guide you through my basic set up so you can do this for yourself.

You will need your own private server (VPS) to host your applications. All that this process requires is it's IP, a SSH private key that can be used to log in, and some configuration files for each application you want to host (will be covered later). Let's get started!

## Part I

The first step to getting your application up and running for the world to see is to create a Dockerfile for it. After that, you can build the image which can be deployed anywhere.

Building the image is done inside your continuous integration (CI) environment. Here you can set up a whole pipeline that runs on every commit: building the image, uploading it, and then triggering a redeployment. Here is an example for GitHub Actions:

```yml
build:
  needs: [formatting, lint, typecheck]
  runs-on: ubuntu-latest
  steps:
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Build Docker image
      uses: docker/build-push-action@v6
      with:
        tags: home:latest
        load: true

    - name: Upload image
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.VPS_KEY }}" > ~/.ssh/id_ed25519
        chmod 600 ~/.ssh/id_ed25519
        ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
        docker save home:latest | gzip | ssh -i ~/.ssh/id_ed25519 github@${{ secrets.VPS_HOST }} "docker load"
```

The complexity here is in the last step of the job. Let's go over it line by line. The intention is to upload the image we just built the step before, to the VPS server where we want to host our application.

```bash
# First we create the local SSH config folder
mkdir -p ~/.ssh

# We take the secret SSH key from GitHub secrets store and place it into the key file
echo "${{ secrets.VPS_KEY }}" > ~/.ssh/id_ed25519

# The key file needs secure ownership for SSH not to complain
chmod 600 ~/.ssh/id_ed25519

# We add the host key to our "known hosts" file in advance so
# SSH won't prompt on upload
ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

# `docker save` will output a raw docker image on STDOUT. We pipe it through GZIP compression, then we pipe it over SSH into the `docker load` command on the other side! Pretty cool!
docker save home:latest | gzip | ssh -i ~/.ssh/id_ed25519 github@${{ secrets.VPS_HOST }} "docker load"
```

## Part II

Once we have built the Docker image for our application and uploaded it to our VPS, we need to deploy it. Let's check out the CI job I use for that:

```yml
deploy:
  if: github.ref == 'refs/heads/main'
  needs: [build]
  runs-on: ubuntu-latest
  steps:
    - name: Deploy the latest version
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.CABIN_KEY }}" > ~/.ssh/id_ed25519
        chmod 600 ~/.ssh/id_ed25519
        ssh-keyscan -H ${{ secrets.CABIN_HOST }} >> ~/.ssh/known_hosts
        ssh -i ~/.ssh/id_ed25519 github@${{ secrets.CABIN_HOST }} "/var/lib/harbor/deploy.sh home"
```

This job only has one step, which is quite similar to the previous job's last step. We prep everything for an SSH conversation, including loading and setting up the private key we use to authenticate from the GitHub CI server. However, the command we execute this time is different:

```bash
$ ssh -i ~/.ssh/id_ed25519 github@${{ secrets.CABIN_HOST }} "/var/lib/harbor/deploy.sh home"
```

As you can see, we are running the `deploy.sh` script located in the `/var/lib/harbor` directory. I picked this name because I think it sounds funny in the context of Docker with the whale icon and container ships and such.

## Part III

Now we come to the exciting part, the magic `deploy.sh` script. Let me spit it out in once, then we'll cover it part by part:

```bash
#!/bin/bash
set -euo pipefail

# Ensure script receives an argument for container name
if [ -z "$1" ]; then
  echo "Usage: $0 <container_name>"
  exit 1
fi

CONTAINER_NAME=$1
APP_DIR="/var/lib/harbor/applications/$CONTAINER_NAME"
DATA_DIR="$APP_DIR/data"
PORT_FILE="$APP_DIR/port"
ENV_FILE="$APP_DIR/environment"

# Ensure the necessary files and directories exist
if [ ! -d "$APP_DIR" ]; then
  echo "Error: Directory $APP_DIR does not exist."
  exit 1
fi

if [ ! -f "$PORT_FILE" ]; then
  echo "Error: Port file $PORT_FILE does not exist."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file $ENV_FILE does not exist."
  exit 1
fi

# Stop the existing container if it is running
echo "Stopping existing container: $CONTAINER_NAME"
docker stop "$CONTAINER_NAME" 1>/dev/null && docker rm "$CONTAINER_NAME" 1>/dev/null

# Read the port from the port file
PORT=$(cat "$PORT_FILE")
if [ -z "$PORT" ]; then
  echo "Error: Port is not specified in $PORT_FILE."
  exit 1
fi

# Read environment variables from the environment file
ENV_VARS=""
while IFS= read -r line; do
  ENV_VARS="$ENV_VARS -e $line"
done < "$ENV_FILE"

ENV_VARS="$ENV_VARS -e PORT=$PORT"

# Run the new container with the same name, exposing the port, and mounting the data volume
echo "Starting new container: $CONTAINER_NAME"
docker run --detach \
  --name "$CONTAINER_NAME" \
  --restart always \
  --publish "$PORT:$PORT" \
  --volume "$DATA_DIR:/data" \
  $ENV_VARS \
  "$CONTAINER_NAME:latest" 1>/dev/null

echo "Deployment complete: $CONTAINER_NAME is now running on port $PORT."

docker image prune --force 1>/dev/null
```

Okay, that was a mouthfull. Let's see ..., part 1:

The script takes a single argument, the "application name" which must be the same as the name of the image. It must also be the name of a directory inside `/var/lib/harbor/applications`:

```bash
# Ensure script receives an argument for container name
if [ -z "$1" ]; then
  echo "Usage: $0 <container_name>"
  exit 1
fi

CONTAINER_NAME=$1
APP_DIR="/var/lib/harbor/applications/$CONTAINER_NAME"
DATA_DIR="$APP_DIR/data"
PORT_FILE="$APP_DIR/port"
ENV_FILE="$APP_DIR/environment"

# Ensure the necessary files and directories exist
if [ ! -d "$APP_DIR" ]; then
  echo "Error: Directory $APP_DIR does not exist."
  exit 1
fi

if [ ! -f "$PORT_FILE" ]; then
  echo "Error: Port file $PORT_FILE does not exist."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file $ENV_FILE does not exist."
  exit 1
fi
```

The folders end up looking like this:

```bash
jens@cabin:/var/lib/harbor$ tree
.
├── applications
│   ├── dawn
│   │   ├── data
│   │   │   └── database.db
│   │   ├── environment
│   │   └── port
│   └── home
│       ├── data
│       ├── environment
│       └── port
└── deploy.sh

6 directories, 6 files
```

Where `dawn` and `home` are both separate applications:

- Each with a "data" directory for persistent data across redeploys
- Each with a `environment` filed with lines:
  ```
  $ cat applications/dawn/environment
  APPLICATION_DATABASE_URL=file:/data/database.db
  PRISMA_DATABASE_URL=file:/data/database.db
  SESSION_SECRET="xxxxxxxxxxxx"
  ```
  These variables are loaded into the container later on in the script.
- A port file for both, which specifies a unique port on localhost on which the container will be listening. This is important because this is the port that Nginx (our reverse proxy exposed to the scary internet) will forward traffic bound for this application to.

Then, the script chains up all the environment variables into a single argument, stops the old container and starts a new one based on the new image we uploaded:

```bash
# Stop the existing container if it is running
echo "Stopping existing container: $CONTAINER_NAME"
docker stop "$CONTAINER_NAME" 1>/dev/null && docker rm "$CONTAINER_NAME" 1>/dev/null

# Read the port from the port file
PORT=$(cat "$PORT_FILE")
if [ -z "$PORT" ]; then
  echo "Error: Port is not specified in $PORT_FILE."
  exit 1
fi

# Read environment variables from the environment file
ENV_VARS=""
while IFS= read -r line; do
  ENV_VARS="$ENV_VARS -e $line"
done < "$ENV_FILE"

ENV_VARS="$ENV_VARS -e PORT=$PORT"

# Run the new container with the same name, exposing the port, and mounting the data volume
echo "Starting new container: $CONTAINER_NAME"
docker run --detach \
  --name "$CONTAINER_NAME" \
  --restart always \
  --publish "$PORT:$PORT" \
  --volume "$DATA_DIR:/data" \
  $ENV_VARS \
  "$CONTAINER_NAME:latest" 1>/dev/null

echo "Deployment complete: $CONTAINER_NAME is now running on port $PORT."
```

Notice that `data` directory with the persistent volume is also configured. This allows application to have a SQLite database or other storage (for images for example) that is not wiped on every deployment.

The new application listens on the same port as the old one was, and is now ready to accept requests.

### Part IV

In order to get the requests from the big scary internet to our application, we use Nginx. A fantastic reverse proxy, a golden multitool of sorts. We define a template for each application we have, defining a hostname (say `cows.foobar.com`) and which port it should be forwarded to. I'll show mine (`/etc/nginx/sites-enabled/dawn`):

```
$ cat /etc/nginx/sites-enabled/dawn
server {
  listen 443 ssl;
  listen [::]:443 ssl;

  ssl_certificate               /etc/ssl/certificate.pem;
  ssl_certificate_key           /etc/ssl/key.pem;
  ssl_client_certificate        /etc/ssl/cloudflare.pem;
  ssl_verify_client on;

  server_name dawn.jensmeindertsma.com;

  location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

The SSL stuff here is not important, this is for an extra-secure end to end encryption between this server and my CDN (Cloudflare). [You can do this too if you want](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/), but you don't have to.

Notice the hostname and then the proxy to `localhost:5001`. `5001` is also the contents of the `/var/lib/harbor/applications/dawn/port` file. This is how Docker and Nginx are coupled.

Now that we have covered the whole deployment process start to end, I'll give you some final pointers:

- DigitalOcean is a great provider to host your first VPS (not sponsored). They offer [great documentation](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04) on how to configure your VPS securely (set up a firewall) and how to install Nginx.
- You'll need a domain name and DNS records that point your (sub)domain to the IP address of your VPS.

Also, I'm working on a secret project that will make this whole process even easier, end to end. Stay tuned for that!

Thanks for reading and see you next time!
