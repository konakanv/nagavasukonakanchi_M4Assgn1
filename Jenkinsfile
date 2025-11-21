pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Install dependencies') {
            steps {
                echo "Installing npm packages..."
                sh 'npm install'
            }
        }

        stage('Lint (ESLint)') {
            steps {
                echo "Running ESLint..."
                sh 'npm run lint || true'
            }
        }

        stage('Build') {
            steps {
                echo "Building BillSplit for production..."
                sh 'npm run build'
            }
        }

        stage('Unit tests (Vitest)') {
            steps {
                echo "Running unit tests..."
                sh 'npm test'
            }
        }

        stage('Dependency audit') {
            steps {
                echo "Checking dependencies with npm audit..."
                sh 'npm audit --audit-level=high || true'
            }
        }

        stage('Verify build output') {
            steps {
                echo "Listing dist/ contents..."
                sh 'ls -lh dist'
            }
        }
    }

    post {
        success {
            echo "Archiving build artifacts from dist/..."
            archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
    }
}
