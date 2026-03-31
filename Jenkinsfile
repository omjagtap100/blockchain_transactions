pipeline {
    agent any

    environment {
        // Your Docker Hub Username
        DOCKER_HUB_USER = 'omjagtap3304'
        // The image name (local and remote)
        IMAGE_NAME = 'tridentity-backend'
        // Full Docker Hub path
        DOCKER_IMAGE_PATH = "${DOCKER_HUB_USER}/${IMAGE_NAME}"
        // Name for the running container
        CONTAINER_NAME = 'tridentity-backend'
        // Port mapping (Host:Container)
        PORT = '5500'
        // Jenkins Credential ID for Docker Hub (Set this up in Jenkins)
        DOCKER_CREDS_ID = 'docker-hub-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${IMAGE_NAME}..."
                    bat "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Login & Push to Docker Hub') {
            steps {
                script {
                    echo 'Logging in and pushing to Docker Hub...'
                    // This securely uses your token stored in Jenkins credentials
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDS_ID) {
                        // Tag the image for Docker Hub
                        bat "docker tag ${IMAGE_NAME}:latest ${DOCKER_IMAGE_PATH}:latest"
                        // Push the tagged image
                        bat "docker push ${DOCKER_IMAGE_PATH}:latest"
                    }
                }
            }
        }

        stage('Stop and Clean Old Container') {
            steps {
                script {
                    try {
                        echo 'Stopping and removing old container if it exists...'
                        bat "docker ps -a -q --filter \"name=${CONTAINER_NAME}\" | findstr /R /C:\".*\" && (docker stop ${CONTAINER_NAME} && docker rm ${CONTAINER_NAME}) || echo No existing container found."
                    } catch (Exception e) {
                        echo "Cleanup ignored as no old container was detected."
                    }
                }
            }
        }

        stage('Deploy Local Container') {
            steps {
                script {
                    echo 'Starting new container from the fresh build...'
                    // Run the container on the host machine
                    bat "docker run -d --name ${CONTAINER_NAME} --env-file .env -p ${PORT}:${PORT} ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Database Migrations') {
            steps {
                script {
                    echo 'Running sequelize migrations inside the container...'
                    bat "docker exec ${CONTAINER_NAME} npm run migrate"
                }
            }
        }
    }

    post {
        always {
            echo 'Build and Deployment completed.'
        }
        failure {
            echo 'Pipeline failed! Check Jenkins logs for details.'
        }
    }
}