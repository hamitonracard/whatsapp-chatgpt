#!/bin/bash

# Check if user has root/sudo access
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root or with sudo."
  exit 1
fi

# Check user's operating system
os=$(uname -s)
case $os in
  Linux)
    # Install required packages using package manager
    if command -v apt-get &> /dev/null; then
      echo "Installing packages using apt-get..."
      apt-get update
      echo "Installing latest version of docker..."
      curl -fsSL https://get.docker.com -o get-docker.sh
      sh get-docker.sh
      apt install -y docker-compose-plugin
      echo "Packages installed successfully."
    elif command -v yum &> /dev/null; then
      echo "Installing packages using yum..."
      yum update
      echo "Installing latest version of docker..."
      curl -fsSL https://get.docker.com -o get-docker.sh
      sh get-docker.sh
      yum install -y git docker-compose-plugin
      echo "Packages installed successfully."
    else
      echo "Unsupported package manager."
      exit 1
    fi
    ;;
  *)
    echo "Unsupported operating system."
    exit 1
    ;;
esac

# Clone Git repo and run Docker Compose
echo "Cloning Git repo..."
git clone https://github.com/askrella/whatsapp-chatgpt.git whatsapp-chatgpt
cd whatsapp-chatgpt

cp .env-example .env

# Prompt user for provider and API key
read -p "AI provider [openai]: " provider
provider=${provider:-openai}
read -p "Enter your API key: " api_key

sed -i "s/^AI_PROVIDER=.*/AI_PROVIDER=$provider/" .env
if [[ "$provider" == "openai" ]]; then
  sed -i "s/^OPENAI_API_KEY=.*/OPENAI_API_KEY=$api_key/" .env
else
  key_var=$(echo "$provider" | tr '[:lower:]' '[:upper:]')_API_KEY
  if grep -q "^${key_var}=" .env; then
    sed -i "s|^${key_var}=.*|${key_var}=$api_key|" .env
  else
    echo "${key_var}=$api_key" >> .env
  fi
fi

# Start Docker Compose
echo "Starting Docker containers..."
docker compose up -d --build
docker compose logs -f
