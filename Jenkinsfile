pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                    python -m venv .venv
                    . .venv/bin/activate
                    pip install --upgrade pip
                    pip install -r backend/requirements.txt
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    . .venv/bin/activate
                    ruff check backend
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    mkdir -p evidence/reports
                    . .venv/bin/activate
                    pytest backend/tests --junitxml=evidence/reports/tests.xml
                '''
            }
        }

        stage('Build artifact') {
            steps {
                sh '''
                    mkdir -p evidence/artifacts
                    zip -r evidence/artifacts/app-${BUILD_NUMBER}.zip \
                        backend frontend docker-compose.yml README.md
                '''
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'evidence/reports/*.xml'
            archiveArtifacts(
                artifacts: 'evidence/artifacts/*.zip,evidence/reports/*.xml',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }
    }
}
