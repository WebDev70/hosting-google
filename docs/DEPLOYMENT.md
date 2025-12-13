# Deployment Options

This document provides a detailed overview of various options for deploying the USA Spending Search application to both Amazon Web Services (AWS) and Google Cloud Platform (GCP).

## Amazon Web Services (AWS) Deployment Options

### Manual Deployment Options

#### 1. AWS Elastic Beanstalk (Easiest for Beginners)

AWS Elastic Beanstalk is a PaaS (Platform-as-a-Service) that automates the deployment and scaling of web applications. It abstracts away the underlying infrastructure, allowing you to focus on your code.

**Detailed Steps:**

1.  **Prerequisites:**
    *   An AWS account.
    *   [AWS CLI](https://aws.amazon.com/cli/) installed and configured (`aws configure`).

2.  **Package Your Application:**
    *   Create a `.zip` with only the app sources (`server.js`, `package.json`, `package-lock.json`, `public/`). **Do NOT include `Dockerfile`** for the Elastic Beanstalk Node.js platform (it uses the native runtime). For example:
        ```bash
        # From within your project's root directory
        zip -r ../deployment-package.zip server.js package.json package-lock.json public
        ```
    *   (Optional) Add an `.ebignore` file to exclude `Dockerfile`, `node_modules/`, `.git/`, and local artifacts so future zips stay lean.

3.  **Create an Elastic Beanstalk Environment via AWS Console:**
    *   Navigate to the **Elastic Beanstalk** service in the AWS Management Console.
    *   Click **"Create a new environment"** and select **"Web server environment."**
    *   **Application name:** Choose a name for your application (e.g., `usaspending-search`).
    *   **Platform:** Select **"Node.js"** from the dropdown.
    *   **Application code:** Choose **"Upload your code"** and select the `deployment-package.zip` file you created.
    *   **Configuration presets:** You can start with "Single instance" for development/testing, or "High availability" for production.
    *   Click **"Create environment."** Elastic Beanstalk will now provision the EC2 instance, security groups, and other necessary resources, and deploy your code.

4.  **Environment Configuration:**
    *   Once your environment is running, you can configure it further. Navigate to **Configuration > Software** to set **Environment properties** (environment variables) if your application needs them.

5.  **Accessing the Application:** Elastic Beanstalk provides a public URL (e.g., `your-app.us-east-1.elasticbeanstalk.com`) to your running application.

#### 2. Amazon ECS with Docker (More Control and Scalability)

Amazon Elastic Container Service (ECS) is a container orchestration service. This method gives you more control over the environment compared to Elastic Beanstalk. We'll focus on the **Fargate** launch type, which is "serverless" (you don't manage the underlying EC2 instances).

**Detailed Steps:**

1.  **Prerequisites:**
    *   An AWS account, AWS CLI installed, and Docker installed locally.

2.  **Build and Push Docker Image to Amazon ECR:**
    *   **Create an ECR Repository:**
        ```bash
        aws ecr create-repository --repository-name usaspending-search --image-scanning-configuration scanOnPush=true
        ```
    *   **Authenticate Docker with ECR:** Get the login command from AWS. The command will be unique to your account and region.
        ```bash
        aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-aws-account-id.dkr.ecr.your-region.amazonaws.com
        ```
    *   **Build, Tag, and Push:**
        ```bash
        # Build the image
        docker build -t usaspending-search .

        # Tag it for ECR
        docker tag usaspending-search:latest your-aws-account-id.dkr.ecr.your-region.amazonaws.com/usaspending-search:latest

        # Push it
        docker push your-aws-account-id.dkr.ecr.your-region.amazonaws.com/usaspending-search:latest
        ```

3.  **Set up Amazon ECS:**
    *   **Create an ECS Cluster:** A cluster is a logical grouping of tasks or services.
        ```bash
        aws ecs create-cluster --cluster-name usaspending-cluster
        ```
    *   **Create an ECS Task Execution Role:** (See detailed steps in the "ECS Task Execution Role Setup" section below)
    *   **Create a Task Definition:** This is a JSON file that describes your container. Create a file `task-definition.json`:
        ```json
        {
            "family": "usaspending-task",
            "executionRoleArn": "arn:aws:iam::your-aws-account-id:role/ecsTaskExecutionRole",
            "networkMode": "awsvpc",
            "containerDefinitions": [
                {
                    "name": "usaspending-container",
                    "image": "your-aws-account-id.dkr.ecr.your-region.amazonaws.com/usaspending-search:latest",
                    "portMappings": [
                        {
                            "containerPort": 3000,
                            "hostPort": 3000,
                            "protocol": "tcp"
                        }
                    ],
                    "essential": true,
                    "logConfiguration": {
                        "logDriver": "awslogs",
                        "options": {
                            "awslogs-group": "/ecs/usaspending-task",
                            "awslogs-region": "your-region",
                            "awslogs-stream-prefix": "ecs"
                        }
                    }
                }
            ],
            "requiresCompatibilities": ["FARGATE"],
            "cpu": "256",
            "memory": "512"
        }
        ```
        **Note:** Replace `your-aws-account-id` and `your-region` with your actual values.
        Register it with AWS: `aws ecs register-task-definition --cli-input-json file://task-definition.json`
    *   **Create an ECS Service:** This will run and maintain your task. You will typically create a service from the AWS console, where you can configure it to use an Application Load Balancer (ALB) to expose your service to the internet. The service ensures that if your task fails, it will be automatically restarted.

4.  **Accessing the Application:** Use the public URL of the load balancer you configured.

### Automated Deployment (CI/CD) Options

#### 1. CI/CD with AWS CodePipeline

AWS CodePipeline automates your release process.

**Conceptual Flow:**

1.  **Source Stage:** Connects to your GitHub repository. A new push to the `main` branch triggers the pipeline.
2.  **Build Stage:** AWS CodeBuild is triggered. It uses a `buildspec.yml` file in your repository to define build commands. This stage would:
    *   Install dependencies (`npm install`).
    *   Build the Docker image.
    *   Push the Docker image to ECR.
3.  **Deploy Stage:** The pipeline updates your ECS service to deploy the new container image.

#### 2. CI/CD with GitHub Actions

GitHub Actions allows you to build CI/CD workflows directly in your repository.

**Conceptual `deploy.yml`:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS ECS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: your-region

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: usaspending-search
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

    - name: Update ECS service
      # Action to update the service with the new image tag
      # (e.g., using aws-actions/amazon-ecs-deploy-task-definition)
```
* **Secrets:** You must store your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your GitHub repository's **Settings > Secrets**.

## Google Cloud Platform (GCP) Deployment Options

### Manual Deployment Options

#### 1. Google Cloud Run (Recommended for Containers)

Google Cloud Run is a fully managed, serverless platform for running stateless containers. It scales automatically, including scaling down to zero when not in use, which can be very cost-effective.

**Detailed Steps:**

1.  **Prerequisites:** A GCP account/project, `gcloud` CLI installed, Docker installed locally.
2.  **Enable APIs:**
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com
    ```
3.  **Build & Push Docker Image to Artifact Registry:**
    *   **Configure Docker:** Authenticate Docker with Artifact Registry.
        ```bash
        gcloud auth configure-docker your-region-docker.pkg.dev
        ```
    *   **Build, Tag, and Push:**
        ```bash
        # Build the image
        docker build -t usaspending-search .

        # Tag it for Artifact Registry
        docker tag usaspending-search:latest your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:latest

        # Push it
        docker push your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:latest
        ```
4.  **Deploy to Cloud Run:**
    *   The `gcloud run deploy` command is simple and powerful.
        ```bash
        gcloud run deploy usaspending-service \
          --image your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:latest \
          --platform managed \
          --region your-chosen-region \
          --allow-unauthenticated # This makes the service publicly accessible
        ```
    *   You can set environment variables with the `--set-env-vars` flag.

5.  **Accessing the Application:** Cloud Run automatically provides a secure HTTPS URL for your service.

**Important Note:** Cloud Run sets the `PORT` environment variable dynamically (typically 8080). The application code (`server.js`) already reads from `process.env.PORT`, so it will automatically adapt to Cloud Run's assigned port.

#### 2. Google App Engine (Flexible Environment)

Google App Engine is a PaaS that is very easy to use. The Flexible Environment runs your application in Docker containers based on your `Dockerfile`.

**Detailed Steps:**

1.  **Prerequisites:** A GCP account/project, `gcloud` CLI installed.
2.  **Create an `app.yaml` file:** This file configures your App Engine service.
    ```yaml
    # app.yaml
    runtime: custom
    env: flex

    # Example of setting environment variables
    # env_variables:
    #   MY_ENV_VAR: "my-value"

    # Example of controlling scaling
    # automatic_scaling:
    #   min_num_instances: 1
    #   max_num_instances: 5
    #   cpu_utilization:
    #     target_utilization: 0.6
    ```
3.  **Deploy the Application:**
    *   `gcloud app deploy`
    *   This single command tells GCP to:
        1.  Build your container image using your `Dockerfile`.
        2.  Push the image to Google Container Registry.
        3.  Deploy the image to your App Engine service.
4.  **Accessing the Application:** App Engine provides a public URL for your application (e.g., `your-project-id.appspot.com`).

### Automated Deployment (CI/CD) Options

#### 1. CI/CD with Google Cloud Build

Google Cloud Build is a fully-managed CI/CD platform that lets you build, test, and deploy software.

**Conceptual `cloudbuild.yaml`:**
```yaml
# cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:$SHORT_SHA', '.']

- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:$SHORT_SHA']

- name: 'gcr.io/google-appengine/exec-wrapper'
  args:
  - 'gcloud'
  - 'run'
  - 'deploy'
  - 'usaspending-service'
  - '--image'
  - 'your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:$SHORT_SHA'
  - '--region'
  - 'your-chosen-region'
  - '--platform'
  - 'managed'
  - '--allow-unauthenticated'
images:
- 'your-region-docker.pkg.dev/your-gcp-project-id/your-repo-name/usaspending-search:$SHORT_SHA'
```
*   **Trigger:** You would set up a Cloud Build Trigger in the GCP console to watch your GitHub repository and run this build file on every push to your `main` branch.

## Additional Configuration Guides

### ECS Task Execution Role Setup

The ECS Task Execution Role is required for Fargate tasks to pull container images from Amazon ECR and send logs to CloudWatch. Follow these steps to create it:

#### Option 1: Using AWS Console (Recommended for Beginners)

1.  **Navigate to IAM:**
    *   Go to the AWS Management Console and navigate to **IAM** (Identity and Access Management).

2.  **Create a New Role:**
    *   Click **Roles** in the left sidebar, then click **Create role**.
    *   Select **AWS service** as the trusted entity type.
    *   Under **Use case**, select **Elastic Container Service** from the service dropdown.
    *   Then select **Elastic Container Service Task** and click **Next**.

3.  **Attach Policies:**
    *   Search for and select the following AWS managed policy:
        *   `AmazonECSTaskExecutionRolePolicy`
    *   This policy grants permissions to:
        *   Pull images from Amazon ECR
        *   Create CloudWatch log groups and streams
        *   Write logs to CloudWatch Logs
    *   Click **Next**.

4.  **Name the Role:**
    *   **Role name:** `ecsTaskExecutionRole` (use this exact name for consistency with the documentation)
    *   **Description:** "Allows ECS tasks to pull images from ECR and send logs to CloudWatch"
    *   Click **Create role**.

5.  **Copy the Role ARN:**
    *   After creation, click on the role name to view its details.
    *   Copy the **ARN** (Amazon Resource Name). It will look like:
        ```
        arn:aws:iam::123456789012:role/ecsTaskExecutionRole
        ```
    *   Use this ARN in your `task-definition.json` file.

#### Option 2: Using AWS CLI

If you prefer the command line, you can create the role with these commands:

1.  **Create a Trust Policy File:**
    *   Create a file named `ecs-task-trust-policy.json`:
        ```json
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Sid": "",
              "Effect": "Allow",
              "Principal": {
                "Service": "ecs-tasks.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        }
        ```

2.  **Create the Role:**
    ```bash
    aws iam create-role \
      --role-name ecsTaskExecutionRole \
      --assume-role-policy-document file://ecs-task-trust-policy.json
    ```

3.  **Attach the Managed Policy:**
    ```bash
    aws iam attach-role-policy \
      --role-name ecsTaskExecutionRole \
      --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    ```

4.  **Get the Role ARN:**
    ```bash
    aws iam get-role --role-name ecsTaskExecutionRole --query 'Role.Arn' --output text
    ```
    *   Copy the output ARN for use in your task definition.

#### Create CloudWatch Log Group (Required for Logging)

Before running your ECS task, create the CloudWatch log group referenced in your task definition:

```bash
aws logs create-log-group --log-group-name /ecs/usaspending-task
```

#### Verify the Role

To verify the role was created correctly:

1.  **Check the role exists:**
    ```bash
    aws iam get-role --role-name ecsTaskExecutionRole
    ```

2.  **Verify attached policies:**
    ```bash
    aws iam list-attached-role-policies --role-name ecsTaskExecutionRole
    ```

You should see `AmazonECSTaskExecutionRolePolicy` in the output.

### Important Notes

*   **Port Configuration:** The application now reads the port from the `PORT` environment variable (`process.env.PORT || 3000`), making it compatible with platforms that dynamically assign ports (Cloud Run, some AWS configurations, Heroku).
*   **Security:** Never commit AWS credentials or secrets to your repository. Use environment variables, AWS Secrets Manager, or GitHub Secrets for sensitive data.
*   **Cost Management:** Remember to stop or delete resources when not in use to avoid unnecessary charges:
    *   AWS: Stop ECS services, delete load balancers, remove unused ECR images
    *   GCP: Delete Cloud Run services or set minimum instances to 0
