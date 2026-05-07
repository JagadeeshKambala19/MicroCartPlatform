output "repository_urls" {
  description = "ECR repository URLs"
  value = {
    for repo_name, repo in aws_ecr_repository.repos :
    repo_name => repo.repository_url
  }
}

output "repository_arns" {
  description = "ECR repository ARNs"
  value = {
    for repo_name, repo in aws_ecr_repository.repos :
    repo_name => repo.arn
  }
}
output "alb_dns_name" {
  value = module.alb.alb_dns_name
}