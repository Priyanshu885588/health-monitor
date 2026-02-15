---

# 🩺 Health Monitor

A containerized health monitoring system that ingests and processes service health events.
The project is designed with a **Node.js ingestion service**, **Python Analytics service**, **Java core service**, Redis, and a fully automated **DevSecOps CI pipeline**.

---



## 🧱 Services

### System Architecture

*   **IoT Gateway (Node.js)**: Acts as the **"Ingestion Layer."** It handles thousands of concurrent **WebSocket/REST** connections from wearable devices.
*   **Message Broker (Redis Streams)**: This is the **backbone**. Node.js produces data to a stream; Python and Java consume from it. This prevents the system from crashing if one service goes down.
*   **Analytics Engine (Python)**: Processes the stream in **real-time**. It focuses on **"Patterns"** (e.g., *Is heart rate > 150?*) rather than individual user identities.
*   **Core Health Service (Java Spring Boot)**: Manages the **"State."** It stores user profiles, historical health trends, and coordinates emergency alerts.

#### Persistence Layer
*   **PostgreSQL**: Used for **relational data** (User profiles, medical history).
*   **Redis**: Used for transient, **real-time "Last Known Value" (LKV)** data.


---
## 🚀 Quick Start

Run the entire application locally with a single command:

```bash
docker compose up --build
```

This will:

* Build all images
* Start required services
* Launch the ingestion service

---

## ⚙️ Prerequisites

Make sure the following are installed:

* Docker (20+)
* Docker Compose (v2+)

---

## 🛠️ Local Development

Start services:

```bash
docker compose up
```

Stop services:

```bash
docker compose down
```

Rebuild after changes:

```bash
docker compose up --build
```

---

## 🔐 CI Pipeline (Node.js --> node-ingestion)

This project uses **GitHub Actions** with a DevSecOps workflow.

### Security Scan

* Secrets detection with GitLeaks
* Static code analysis with Semgrep

### Dependency Scan

* Vulnerability detection using npm audit
* Deep CVE analysis via OWASP Dependency-Check

### Build & Test

* Install dependencies
* Run ESLint
* Execute automated tests

### Docker Build & Push

* Builds Docker image
* Pushes to Docker Hub on `main` branch

---

## 🔄 CI Pipeline Flow

```
Security Scan ─┐
               ├──► Build & Test ───► Docker Push
Dependency Scan┘
```

---

## 🛡️ Security Approach

The project follows a **shift-left security model**:

* Secrets detected before build
* Code analyzed for vulnerabilities
* Dependencies continuously scanned
* Only validated builds are published

---

## 📦 Docker Images

Images are automatically built and pushed to Docker Hub when code is merged into the `main` branch.

---

## 📜 License

MIT ( attaching your license if present )

