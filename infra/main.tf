# Create ECR repositories
resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repository_names)

  name                 = each.value
  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Project = "ecr-demo"
    Env     = "dev"
  }
}

# Lifecycle policy for each repository
resource "aws_ecr_lifecycle_policy" "repos_policy" {
  for_each = aws_ecr_repository.repos

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last N images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.max_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
module "vpc" {
  source = "./modules/vpc"

  project_name = "microcart"
  environment  = "dev"
}

module "iam" {
  source = "./modules/iam"

  project_name        = "microcart"
  environment         = "dev"
  ecr_repository_arns = [for repo in aws_ecr_repository.repos : repo.arn]
}

module "ecs" {
  source = "./modules/ecs"

  project_name = "microcart"
  environment  = "dev"

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  ecs_execution_role_arn = module.iam.ecs_execution_role_arn
  ecs_task_role_arn      = module.iam.ecs_task_role_arn

  # pick one repo to start (e.g. frontend)
container_image = "${aws_ecr_repository.repos["frontend"].repository_url}:latest"

  container_port = 3000
  target_group_arn = module.alb.target_group_arn

  environment_variables = {
    NODE_ENV = "production"
  }
}

module "alb" {
  source = "./modules/alb"

  project_name = "microcart"
  environment  = "dev"

  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}