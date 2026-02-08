// test-controller.js
// Controlador del flujo del test de usabilidad
// Usa mouse tracking como alternativa a eye tracking

import { gazeTracker } from './gaze-tracker.js';

class TestController {
    constructor() {
        this.isTestRunning = false;
        this.testDuration = 60000; // 60 segundos
        this.timerInterval = null;
        this.taskCompleted = false;
        this.ctaListenersConfigured = false;
    }

    /**
     * Inicializa el controlador del test
     */
    async init() {
        console.log('TestController inicializado (modo mouse tracking)');
        
        // Verificar parámetro URL
        const urlParams = new URLSearchParams(window.location.search);
        const isCalibrated = urlParams.get('calibrated') === 'true';
        
        if (!isCalibrated) {
            this.showError('Por favor, inicia el test desde el laboratorio después de calibrar.');
            return;
        }
        
        console.log('Acceso autorizado, preparando test...');
        
        // Event listeners
        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        const btnStartTask = document.getElementById('btnStartTask');

        if (btnStartTask) {
            btnStartTask.addEventListener('click', () => {
                this.startTest();
            });
        }
    }

    /**
     * Configura el listener del botón objetivo
     */
    setupCTAListeners() {
        if (this.ctaListenersConfigured) {
            console.log('CTA ya configurado, saltando...');
            return;
        }

        // EL ÚNICO BOTÓN OBJETIVO: "Iniciar prueba"
        const ctaTarget = document.getElementById('ctaTarget');

        if (ctaTarget) {
            ctaTarget.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click en botón objetivo detectado');
                this.completeTask('Botón objetivo - Iniciar prueba');
            }, { once: true });
        }
        
        this.ctaListenersConfigured = true;
        console.log('Botón objetivo configurado correctamente');
    }

    /**
     * Inicia el test de usabilidad
     */
    startTest() {
        if (this.isTestRunning) {
            console.log('Test ya está en ejecución');
            return;
        }

        console.log('Iniciando test de usabilidad (mouse tracking)...');
        
        this.isTestRunning = true;
        this.taskCompleted = false;
        
        // Ocultar overlay de instrucciones
        const overlay = document.getElementById('instructionsOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        // Mostrar timer
        const timer = document.getElementById('timer');
        if (timer) {
            timer.style.display = 'block';
        }
        
        // Mostrar banner de tarea
        const taskBanner = document.getElementById('taskBanner');
        if (taskBanner) {
            taskBanner.style.display = 'block';
        }
        
        // Iniciar grabación de coordenadas
        gazeTracker.startRecording(this.testDuration);
        
        // Configurar captura de mouse
        this.setupMouseTracking();
        
        // Iniciar countdown
        this.startTimer();
        
        // Configurar botón objetivo
        this.setupCTAListeners();
    }

    /**
     * Configura el tracking del mouse
     */
    setupMouseTracking() {
        this.mouseTrackHandler = (event) => {
            if (this.isTestRunning) {
                gazeTracker.recordGazePoint(event.clientX, event.clientY);
            }
        };
        
        document.addEventListener('mousemove', this.mouseTrackHandler);
        console.log('Mouse tracking activado');
    }

    /**
     * Inicia el timer visual
     */
    startTimer() {
        let secondsLeft = this.testDuration / 1000;
        const timerText = document.getElementById('timerText');
        
        this.timerInterval = setInterval(() => {
            secondsLeft--;
            
            if (timerText) {
                timerText.textContent = `${secondsLeft}s`;
                
                if (secondsLeft <= 10) {
                    timerText.style.color = '#e74c3c';
                }
            }
            
            if (secondsLeft <= 0) {
                this.endTest('timeout');
            }
        }, 1000);
    }

    /**
     * Marca la tarea como completada
     */
    completeTask(buttonClicked) {
        if (!this.isTestRunning) {
            console.log('Test no está corriendo, ignorando click');
            return;
        }
        
        if (this.taskCompleted) {
            console.log('Tarea ya completada, ignorando click duplicado');
            return;
        }
        
        console.log(`Tarea completada: ${buttonClicked}`);
        this.taskCompleted = true;
        
        this.endTest('completed', buttonClicked);
    }

    /**
     * Finaliza el test
     */
    endTest(reason, details = '') {
        if (!this.isTestRunning) {
            console.log('Test ya fue finalizado');
            return;
        }
        
        console.log(`Test finalizado: ${reason}`);
        
        this.isTestRunning = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.mouseTrackHandler) {
            document.removeEventListener('mousemove', this.mouseTrackHandler);
            this.mouseTrackHandler = null;
        }
        
        const gazeData = gazeTracker.stopRecording();
        
        console.log(`Datos capturados: ${gazeData.length} puntos`);
        
        const testResults = {
            reason: reason,
            details: details,
            taskCompleted: this.taskCompleted,
            gazeData: gazeData,
            stats: gazeTracker.getStats(),
            trackingMethod: 'mouse',
            timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem('testResults', JSON.stringify(testResults));
        
        console.log('Resultados guardados en sessionStorage');
        
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 1000);
    }

    /**
     * Muestra un error al usuario
     */
    showError(message) {
        const overlay = document.getElementById('instructionsOverlay');
        if (overlay) {
            const content = overlay.querySelector('.instructions-content');
            if (content) {
                content.innerHTML = `
                    <h2>Error</h2>
                    <p style="color: #e74c3c; margin-bottom: 20px;">${message}</p>
                    <button class="btn-start" onclick="window.close()">Cerrar</button>
                `;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const controller = new TestController();
    controller.init();
});