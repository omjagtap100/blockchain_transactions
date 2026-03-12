pipeline {
    agent any

    tools {
        nodejs "node18"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/omjagtap100/triapp_blockchain.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Database Migration') {
            steps {
                sh 'npm run migrate'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Start Server') {
            steps {
                // Ensure pm2 handles both the main API and the cron/fetching service
                sh 'pm2 restart company-api || pm2 start src/company.js --name "company-api"'
                sh 'pm2 restart fetch-cron || pm2 start server.js --name "fetch-cron"'
            }
        }
    }
}