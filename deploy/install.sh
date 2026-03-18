#!/bin/bash
# ================================================
# LOCSA SARL — Script d'installation EC2 (Ubuntu)
# Usage: bash install.sh
# ================================================

set -e

echo "======================================"
echo " LOCSA SARL — Installation EC2"
echo "======================================"

# 1. Mise à jour système
echo "[1/6] Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installer Docker
echo "[2/6] Installation de Docker..."
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Permettre docker sans sudo
sudo usermod -aG docker $USER

# 3. Installer Docker Compose standalone
echo "[3/6] Installation de Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Installer Nginx + Certbot
echo "[4/6] Installation de Nginx + Certbot..."
sudo apt install -y nginx certbot python3-certbot-nginx

# 5. Cloner le projet
echo "[5/6] Clonage du projet LOCSA..."
cd /home/ubuntu
git clone https://github.com/ElimranyAbdelmoumen/LOCSA_Gestion_Stock.git locsa
cd locsa

# 6. Lancer l'application
echo "[6/6] Démarrage de l'application..."
docker-compose up -d --build

echo ""
echo "======================================"
echo " Installation terminée !"
echo " Backend  : http://$(curl -s ifconfig.me):8080"
echo " Frontend : http://$(curl -s ifconfig.me):5173"
echo "======================================"
echo ""
echo "Prochaine étape : configurer Nginx + HTTPS"
echo "  bash /home/ubuntu/locsa/deploy/nginx-setup.sh votre-domaine.com"
