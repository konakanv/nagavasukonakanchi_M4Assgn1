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
                echo "Running npm audit for high severity vulnerabilities..."
                script {
                    // Run npm audit and capture the exit code
                    def status = sh(script: 'npm audit --audit-level=high', returnStatus: true)

                    if (status != 0) {
                        echo "High severity vulnerabilities found. Sending security incident email..."

                        // Email specifically for dependency issues
                        emailext(
                            subject: "BillSplit CI: Dependency vulnerabilities detected in ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: """\
                                    Hello,

                                    The npm audit step in Jenkins detected HIGH severity vulnerabilities in the BillSplit project.

                                    Job: ${env.JOB_NAME}
                                    Build: #${env.BUILD_NUMBER}
                                    URL: ${env.BUILD_URL}

                                    Please review the Jenkins console output and address the vulnerabilities before the next deployment.

                                    Thanks,
                                    Jenkins
                                    """,
                            to: 'nkonak2@lsu.edu'
                        )

                       
                        error("High severity dependency vulnerabilities detected.")
                    } else {
                        echo "No high severity vulnerabilities detected."
                    }
                }
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
            echo "Build succeeded. Archiving build artifacts from dist/..."
            archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }

        failure {
            echo "Build failed. Sending general incident email..."
            emailext(
                subject: "BillSplit CI FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """\
                        Hello,

                        The Jenkins pipeline for the BillSplit project has FAILED.

                        Job: ${env.JOB_NAME}
                        Build: #${env.BUILD_NUMBER}
                        URL: ${env.BUILD_URL}

                        Please review the Jenkins console log and stage outputs to identify the cause.

                        Thanks,
                        Jenkins
                        """,
                to: 'nkonak2@lsu.edu'
            )
        }
    }
}
