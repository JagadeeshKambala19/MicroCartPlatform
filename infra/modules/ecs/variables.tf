variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (dev/stage/prod)"
  type        = string
}

variable "region" {
  description = "AWS region for logs"
  type        = string
  default     = "ap-south-1"
}

variable "vpc_id" {
  description = "VPC ID (for security group)"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnets for ECS tasks"
  type        = list(string)
}

variable "ecs_execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ECS task role ARN"
  type        = string
}

variable "container_image" {
  description = "ECR image URI (e.g. 123.dkr.ecr.../repo:tag)"
  type        = string
}

variable "container_port" {
  description = "Container port your app listens on"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of tasks"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "Fargate CPU units (256, 512, 1024...)"
  type        = string
  default     = "256"
}

variable "memory" {
  description = "Fargate memory (512, 1024, 2048...)"
  type        = string
  default     = "512"
}

variable "environment_variables" {
  description = "Key/value env vars for container"
  type        = map(string)
  default     = {}
}