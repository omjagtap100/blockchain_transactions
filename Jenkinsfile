pipeline {
    agent any

    tools {
        nodejs "node18"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/yourusername/node-api.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Start Server') {
            steps {
                sh 'pm2 restart server || pm2 start server.js'
            }
        }
    }
}