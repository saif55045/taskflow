# TaskFlow — Task Manager Application

A modern, containerized full-stack task manager built with **React**, **Node.js/Express**, and **MongoDB**. Deployed using **Docker**, **Docker Compose**, and **Kubernetes**.

## 📋 Project Overview

TaskFlow is a minimalistic task management application that allows users to:
- Create, view, complete, and delete tasks
- Set task priority (Low, Medium, High)
- Filter tasks by status (All, Active, Completed)

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│   MongoDB   │
│  React+Nginx │     │   Express   │     │  Database   │
│   Port 80    │     │  Port 5000  │     │ Port 27017  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🛠 Tools & Technologies

| Technology     | Purpose                    |
|----------------|----------------------------|
| React + Vite   | Frontend UI                |
| Node.js + Express | Backend REST API        |
| MongoDB        | NoSQL Database             |
| Docker         | Containerization           |
| Docker Compose | Multi-container orchestration |
| Kubernetes     | Container orchestration & scaling |
| Nginx          | Frontend web server & reverse proxy |

## 📁 Project Structure

```
Assignment2/
├── frontend/                  # React frontend
│   ├── Dockerfile             # Multi-stage build (Node → Nginx)
│   ├── nginx.conf             # Reverse proxy configuration
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Component styles
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # Entry point
│   └── package.json
├── backend/                   # Node.js backend
│   ├── Dockerfile             # Node.js Alpine image
│   ├── server.js              # Express server + MongoDB connection
│   └── package.json
├── k8s/                       # Kubernetes manifests
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── db-deployment.yaml
│   ├── db-service.yaml
│   ├── pv.yaml                # Persistent Volume
│   ├── pvc.yaml               # Persistent Volume Claim
│   └── hpa.yaml               # Horizontal Pod Autoscaler
├── docker-compose.yml         # Multi-container setup
└── README.md
```

---

## 🐳 TASK 1: Docker Build & Run

### Build Docker Images

```bash
# Build frontend image
docker build -t taskflow-frontend ./frontend

# Build backend image
docker build -t taskflow-backend ./backend
```

### Run Containers Individually

```bash
# Start MongoDB
docker run -d --name taskflow-mongo -p 27017:27017 mongo:7.0

# Start backend (link to MongoDB)
docker run -d --name taskflow-backend \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://taskflow-mongo:27017/taskmanager \
  --link taskflow-mongo:taskflow-mongo \
  taskflow-backend

# Start frontend (link to backend)
docker run -d --name taskflow-frontend \
  -p 3000:80 \
  --link taskflow-backend:backend \
  taskflow-frontend
```

### Verify
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🐙 TASK 2: Docker Compose Setup

### Run All Services

```bash
# Start all services in detached mode
docker-compose up -d --build

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services Configuration

| Service    | Port Mapping   | Network         |
|------------|---------------|-----------------|
| Frontend   | 3000 → 80     | taskflow-network |
| Backend    | 5000 → 5000   | taskflow-network |
| MongoDB    | 27017 → 27017 | taskflow-network |

---

## ☸️ TASK 3: Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (Minikube / Docker Desktop / kind)
- `kubectl` configured

### Deploy Application

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Or apply individually in order
kubectl apply -f k8s/pv.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/db-deployment.yaml
kubectl apply -f k8s/db-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/hpa.yaml
```

### Verify Deployment

```bash
# Check all resources
kubectl get all

# Check pods
kubectl get pods

# Check services
kubectl get services

# Check persistent volumes
kubectl get pv,pvc
```

### Access the Application
```bash
# If using Minikube
minikube service frontend-service

# If using Docker Desktop, access via
# http://localhost:30080
```

---

## 💾 TASK 4: Persistent Storage

MongoDB data is persisted using Kubernetes Persistent Volumes:

- **PersistentVolume (PV)**: 1Gi `hostPath` volume at `/mnt/data/mongo`
- **PersistentVolumeClaim (PVC)**: Requests 1Gi, bound to PV
- Mounted at `/data/db` inside the MongoDB container

```bash
# Verify PV and PVC
kubectl get pv
kubectl get pvc
```

---

## 📈 TASK 5: Scaling Configuration

Horizontal Pod Autoscaler (HPA) is configured for the backend:

| Parameter         | Value |
|-------------------|-------|
| Min Replicas      | 2     |
| Max Replicas      | 5     |
| CPU Target        | 70%   |
| Target Deployment | backend-deployment |

```bash
# Check HPA status
kubectl get hpa

# Watch scaling
kubectl get hpa -w

# Manual scaling (optional)
kubectl scale deployment backend-deployment --replicas=4
```

> **Note:** HPA requires the Kubernetes Metrics Server to be installed in your cluster.

---

## 👥 Team Members

| Name | Roll Number |
|------|-------------|
| Saif Ullah | 22F-3644 |
| Farhan Akhtar | 22F-3682 |

---

## 📝 License

This project was developed as part of the DevOps course (8th Semester) assignment.
