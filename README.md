# MicroCart

## Overview

MicroCart Platform is a production-grade cloud-native e-commerce microservices application designed to demonstrate modern cloud architecture, DevOps automation, container orchestration, infrastructure provisioning, and scalable deployment practices using AWS.

The project combines:

* Microservices architecture
* Docker containerization
* AWS ECS Fargate deployment
* Terraform Infrastructure as Code
* GitHub Actions CI/CD
* Amazon RDS MySQL
* Application Load Balancer
* Amazon ECR container registry
* Auto Scaling infrastructure

This project is designed to simulate real-world enterprise deployment patterns and operational workflows.

---

# Architecture Overview

## High-Level Architecture

Client Request
↓
Application Load Balancer
↓
ECS Fargate Services
↓
Microservices Layer
↓
Amazon RDS MySQL

Supporting Services:

* Amazon ECR
* Terraform
* GitHub Actions
* Amazon CloudWatch Logs
* IAM Roles and Policies
* VPC Networking

---

# Tech Stack

## Database

* MySQL 8

## Containerization

* Docker
* Docker Compose

## Cloud Infrastructure

* AWS ECS Fargate
* AWS VPC
* AWS ALB
* AWS RDS
* AWS ECR
* AWS IAM
* AWS CloudWatch

## Infrastructure as Code

* Terraform

## CI/CD

* GitHub Actions

---

# Microservices Architecture

The application follows a distributed microservices architecture.

## Services

### Auth Service

Responsibilities:

* User authentication
* User authorization
* JWT token management

Port:

```bash
4001
```

---

### Product Service

Responsibilities:

* Product catalog management
* Product retrieval
* Inventory-related operations

Port:

```bash
4002
```

---

### Cart Service

Responsibilities:

* Shopping cart operations
* Add/remove/update cart items

Port:

```bash
4003
```

---

### Order Service

Responsibilities:

* Order placement
* Order tracking
* Order processing

Port:

```bash
4004
```

---

### Frontend

Responsibilities:

* User interface
* API integration
* Customer interaction

Port:

```bash
5173
```

---

# Repository Structure

```bash
MicroCartPlatform/
│
├── frontend/
├── services/
│   ├── auth-service/
│   ├── product-service/
│   ├── cart-service/
│   └── order-service/
│
├── db/
├── infra/
│   ├── modules/
│   ├── main.tf
│   ├── outputs.tf
│   └── variables.tf
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

# Local Development Setup

## Prerequisites

Install:

* Node.js
* Docker
* Docker Compose
* AWS CLI
* Terraform
* Git

---

# Step 1: Clone Repository

```bash
git clone <repository-url>
cd MicroCartPlatform
```

---

# Step 2: Install Dependencies

```bash
npm install
```

---

# Step 3: Configure Environment Variables

Create:

```bash
.env
```

Example:

```env
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=ecommerce
JWT_SECRET=mysecret
```

---

# Step 4: Start MySQL Container

```bash
docker compose up -d mysql
```

---

# Step 5: Start All Services

```bash
npm run dev
```

---

# Access Application

Frontend:

```bash
http://localhost:5173
```

Services:

```bash
Auth Service:     http://localhost:4001
Product Service:  http://localhost:4002
Cart Service:     http://localhost:4003
Order Service:    http://localhost:4004
```

---

# Docker Architecture

The platform uses Docker containers for isolated runtime environments.

## Docker Compose Services

* mysql
* auth-service
* product-service
* cart-service
* order-service
* frontend

---

# Docker Commands

## Build Containers

```bash
docker compose build
```

---

## Start Containers

```bash
docker compose up -d
```

---

## Stop Containers

```bash
docker compose down
```

---

## View Running Containers

```bash
docker ps
```

---

## View Logs

```bash
docker logs <container-name>
```

---

# AWS Infrastructure

The infrastructure is provisioned using Terraform.

---

# Core AWS Services

## Amazon VPC

Purpose:

* Network isolation
* Public/private subnet separation
* Secure traffic flow

Components:

* Public subnets
* Private subnets
* Internet Gateway
* NAT Gateway
* Route tables

---

## Amazon ECS Fargate

Purpose:

* Serverless container orchestration
* Scalable application hosting

Features:

* Task definitions
* ECS services
* Auto Scaling
* High availability

---

## Amazon ECR

Purpose:

* Docker image storage
* Versioned container registry

Repositories:

* frontend
* backend services

---

## Application Load Balancer

Purpose:

* Traffic distribution
* Health checks
* Service routing

Features:

* Public entry point
* ECS target group integration

---

## Amazon RDS MySQL

Purpose:

* Managed relational database
* Persistent application storage

Features:

* Automated backups
* Private subnet deployment
* Secure access

---

## IAM

Purpose:

* Least privilege access control
* ECS task execution permissions
* CI/CD access management

---

## CloudWatch Logs

Purpose:

* Centralized logging
* Runtime debugging
* Container log aggregation

---

# Terraform Infrastructure

Infrastructure is managed inside:

```bash
infra/
```

---

# Terraform Modules

## VPC Module

Creates:

* VPC
* Public/private subnets
* NAT Gateway
* Route tables

---

## ECS Module

Creates:

* ECS Cluster
* ECS Services
* Task definitions
* Auto Scaling policies

---

## ALB Module

Creates:

* Application Load Balancer
* Target groups
* Listener rules

---

## RDS Module

Creates:

* MySQL database
* DB subnet groups
* Security groups

---

## IAM Module

Creates:

* ECS execution role
* ECS task role
* Required IAM policies

---

# Terraform Commands

## Initialize Terraform

```bash
cd infra
terraform init
```

---

## Validate Terraform

```bash
terraform validate
```

---

## Preview Infrastructure

```bash
terraform plan
```

---

## Apply Infrastructure

```bash
terraform apply
```

---

## Destroy Infrastructure

```bash
terraform destroy
```

---

# Amazon ECR Workflow

## Authenticate Docker

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
```

---

## Build Frontend Image

```bash
docker build -t frontend ./frontend
```

---

## Tag Image

```bash
docker tag frontend:latest <ecr-url>/frontend:latest
```

---

## Push Image

```bash
docker push <ecr-url>/frontend:latest
```

---

# CI/CD Pipeline

CI/CD is implemented using GitHub Actions.

Workflow location:

```bash
.github/workflows/
```

---

# CI/CD Pipeline Stages

## Stage 1: Source

Triggered on:

```bash
Push to main branch
```

---

## Stage 2: Build

Pipeline:

* Install dependencies
* Build Docker images
* Run validations

---

## Stage 3: Push Images

Pipeline:

* Authenticate to ECR
* Push container images

---

## Stage 4: Deployment

Pipeline:

* Trigger ECS deployment
* Update running services

---

# GitHub Secrets Required

Configure inside GitHub:

```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
ECS_CLUSTER
ECS_SERVICE
```

---

# ECS Deployment Workflow

Deployment Flow:

1. Code pushed to GitHub
2. GitHub Actions triggered
3. Docker images built
4. Images pushed to ECR
5. ECS service updated
6. New tasks deployed automatically

---

# Auto Scaling Configuration

The platform uses ECS Service Auto Scaling.

Scaling Policy:

```bash
Scale Out:
CPU > 60%

Scale In:
CPU < 30%
```

Benefits:

* Elastic scaling
* Improved availability
* Cost optimization

---

# Security Architecture

## Networking Security

* ECS deployed in private subnets
* RDS deployed in private subnets
* ALB exposed publicly

---

## Security Groups

Rules:

* ALB accepts public traffic
* ECS accepts traffic only from ALB
* RDS accepts traffic only from ECS

---

## IAM Security

Practices:

* Least privilege IAM roles
* No hardcoded AWS credentials
* ECS task execution roles

---

## AWS Identity Validation

```bash
aws sts get-caller-identity
```

---

# Engineering Concepts Demonstrated

This project demonstrates:

* Cloud-native architecture
* Microservices deployment
* Container orchestration
* Infrastructure as Code
* CI/CD automation
* Cloud networking
* Secure application deployment
* Auto Scaling infrastructure


