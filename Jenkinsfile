pipeline {
    agent {
        docker {
            image 'node:lts-windows'
        }
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Database Migration') {
            steps {
                bat 'npm run migrate'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Info') {
            steps {
                bat 'node -v'
                bat 'npm -v'
            }
        }
    }

    post {
        always {
            echo 'Build completed in Docker (Windows container).'
        }
        failure {
            echo 'Build failed! Check logs.'
        }
    }
}