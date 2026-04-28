variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "ap-south-1"
}

variable "repository_names" {
  description = "List of ECR repository names"
  type        = list(string)
  default     = [
    "frontend",
    "cart-service",
    "order-service",
    "product-service",
    "auth-service"
  ]
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Enable image scanning on push"
  type        = bool
  default     = true
}

variable "max_image_count" {
  description = "Maximum number of images to retain"
  type        = number
  default     = 10
}