pipeline {
    agent any

    docker {
        image 'node:18'
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

        stage('Deploy / Restart') {
            steps {
             
                bat 'pm2 restart tridentity-api || pm2 start src/company.js --name "tridentity-api"'
                bat 'pm2 restart tridentity-cron || pm2 start server.js --name "tridentity-cron"'
            }
        }
    }

    post {
        always {
            echo 'Build completed.'
        }
        failure {
            echo 'Build failed! Check the logs.'
        }
    }
}
