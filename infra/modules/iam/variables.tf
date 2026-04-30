variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "microcart"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "users" {
  description = "List of IAM users to create"
  type        = list(string)
  default     = ["jagadeeshdevops"]
}


variable "user_permissions" {
  description = "Map of user to their permissions"
  type        = map(string)
  default = {
    "jagadeeshdevops" = "AdministratorAccess"
  }
}

variable "ecr_repository_arns" {
  description = "ECR repositories allowed for CodeBuild"
  type        = list(string)
  default     = []
}