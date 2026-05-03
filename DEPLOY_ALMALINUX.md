# Deploy Boighor Commerce on AlmaLinux Docker Server

Target server:

```text
172.16.0.170
```

Recommended flow:

1. Push this project from the local Windows machine to GitHub.
2. SSH into the AlmaLinux server.
3. Clone or pull the GitHub repository.
4. Build and run the Docker container with Docker Compose.

## 1. Push From Local Machine to GitHub

From `E:\Myecommerce` on the local machine:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/boighor-commerce.git
git push -u origin main
```

If the remote already exists:

```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/boighor-commerce.git
git push -u origin main
```

## 2. Prepare AlmaLinux Server

SSH into the server:

```bash
ssh YOUR_USER@172.16.0.170
```

Check Docker:

```bash
docker --version
docker compose version
```

Start Docker if needed:

```bash
sudo systemctl enable --now docker
```

## 3. Clone the Project on Server

Choose an app folder:

```bash
sudo mkdir -p /opt/boighor-commerce
sudo chown -R "$USER":"$USER" /opt/boighor-commerce
```

Clone from GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/boighor-commerce.git /opt/boighor-commerce
cd /opt/boighor-commerce
```

## 4. Build and Run Docker

```bash
docker compose up --build -d
```

Open from another computer on the same network:

```text
http://172.16.0.170:8080
```

## 5. Update Later

When you make changes locally:

```powershell
git add .
git commit -m "Update ecommerce app"
git push
```

Then on AlmaLinux:

```bash
cd /opt/boighor-commerce
git pull
docker compose up --build -d
```

## Firewall

If port `8080` is blocked on AlmaLinux:

```bash
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

## Useful Docker Commands

```bash
docker compose ps
docker compose logs -f
docker compose down
docker compose up --build -d
```
