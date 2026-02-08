// main.js
// Punto de entrada principal que conecta todos los módulos

import { webGazerManager } from './webgazer-manager.js';
import { uiControls } from './ui-controls.js';
import { calibration } from './calibration.js';

class App {
    constructor() {
        this.isTracking = false;
        this.isCalibrated = false;
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        console.log('Inicializando aplicación...');
        
        // Inicializar módulos
        uiControls.init();
        calibration.init();
        
        // Configurar callbacks de calibración
        calibration.setOnComplete((metrics) => {
            this.onCalibrationComplete(metrics);
        });
        
        calibration.setOnCancel(() => {
            this.onCalibrationCancel();
        });
        
        // Configurar event listeners
        this.setupEventListeners();
        
        console.log('Aplicación lista');
    }

    /**
     * Configura los event listeners de los botones
     */
    setupEventListeners() {
        const btnStart = document.getElementById('btnStart');
        const btnCalibrate = document.getElementById('btnCalibrate');
        const btnStop = document.getElementById('btnStop');

        // Botón Iniciar
        btnStart.addEventListener('click', () => {
            this.handleStart();
        });

        // Botón Calibrar
        btnCalibrate.addEventListener('click', () => {
            this.handleCalibrate();
        });

        // Botón Detener
        btnStop.addEventListener('click', () => {
            this.handleStop();
        });
    }

    /**
     * Maneja el evento de iniciar WebGazer
     */
    async handleStart() {
        try {
            uiControls.updateStatus('Iniciando WebGazer...', '#f39c12');
            
            // Iniciar WebGazer
            const success = await webGazerManager.start();
            
            if (success) {
                // Configurar el listener de mirada
                this.setupGazeTracking();
                
                // Actualizar UI
                uiControls.updateButtons(true, false);
                uiControls.showSuccess('WebGazer activo - Presiona "Calibrar" para mejorar la precisión');
                uiControls.showGazeDot();
                
                this.isTracking = true;
            } else {
                uiControls.showError('No se pudo iniciar WebGazer');
            }
            
        } catch (error) {
            console.error('Error al iniciar:', error);
            uiControls.showError('Error al acceder a la cámara');
        }
    }

    /**
     * Maneja el evento de calibrar
     */
    handleCalibrate() {
        if (!this.isTracking) {
            uiControls.showWarning('Inicia WebGazer primero');
            return;
        }

        try {
            // Actualizar estado
            uiControls.updateStatus('Calibrando... Mira cada punto y haz click', '#f39c12');
            uiControls.updateButtons(true, true); // Deshabilitar calibrar durante el proceso
            
            // Iniciar calibración
            calibration.start();
            
            console.log('Proceso de calibración iniciado');
            
        } catch (error) {
            console.error('Error al iniciar calibración:', error);
            uiControls.showError('Error al iniciar calibración');
            uiControls.updateButtons(true, false);
        }
    }

    /**
     * Maneja el evento de detener WebGazer
     */
    handleStop() {
        try {
            // Si está calibrando, cancelar primero
            if (calibration.isActive()) {
                calibration.cancel();
            }
            
            // Detener WebGazer
            webGazerManager.stop();
            
            // Ocultar sección de test
            this.hideTestSection();
            
            // Actualizar UI
            uiControls.updateButtons(false, false);
            uiControls.updateStatus('Detenido', '#95a5a6');
            uiControls.hideGazeDot();
            
            this.isTracking = false;
            this.isCalibrated = false;
            
            console.log('WebGazer detenido por el usuario');
            
        } catch (error) {
            console.error('Error al detener:', error);
            uiControls.showError('Error al detener WebGazer');
        }
    }

    /**
     * Configura el tracking de la mirada
     */
    setupGazeTracking() {
        webGazerManager.setGazeListener((data, elapsedTime) => {
            if (!this.isTracking) return;
            
            // No actualizar dot durante calibración
            if (calibration.isActive()) return;
            
            // Obtener coordenadas
            const x = data.x;
            const y = data.y;
            
            // Actualizar posición del dot
            uiControls.updateGazeDotPosition(x, y);
            
            // Log cada 2 segundos (opcional, para debug)
            if (Math.floor(elapsedTime) % 2000 === 0) {
                console.log(`Mirada en: (${Math.round(x)}, ${Math.round(y)})`);
            }
        });
    }

    /**
     * Callback cuando la calibración se completa
     */
    onCalibrationComplete(metrics) {
        console.log('Calibración completada exitosamente');
        
        this.isCalibrated = true;
        
        // Actualizar UI
        uiControls.showSuccess('Calibración completada - El tracking debería ser más preciso');
        uiControls.updateButtons(true, false);
        
        // ✅ NUEVO: Mostrar sección de test
        this.showTestSection(metrics);
        
        // Pequeño delay para que el usuario lea el mensaje
        setTimeout(() => {
            uiControls.updateStatus('WebGazer activo y calibrado', '#27ae60');
        }, 3000);
    }

    /**
     * Callback cuando la calibración se cancela
     */
    onCalibrationCancel() {
        console.log('Calibración cancelada');
        
        // Actualizar UI
        uiControls.updateStatus('Calibración cancelada', '#f39c12');
        uiControls.updateButtons(true, false);
    }

    /**
     * ✅ NUEVO: Muestra la sección de test después de calibrar
     * @param {Object} metrics - Métricas de calibración
     */
    showTestSection(metrics) {
        const testSection = document.getElementById('testSection');
        const btnStartTest = document.getElementById('btnStartTest');
        
        if (testSection) {
            testSection.style.display = 'block';
            
            // Agregar info de precisión si está disponible
            if (metrics) {
                const testInfo = testSection.querySelector('.test-info p');
                if (testInfo) {
                    testInfo.textContent = `Sistema calibrado con precisión de ${metrics.avgErrorPx}px. Listo para el test.`;
                }
            }
        }
        
        // Event listener para el botón de test (solo una vez)
        if (btnStartTest && !btnStartTest.dataset.listenerAttached) {
            btnStartTest.addEventListener('click', () => {
                this.handleStartTest();
            });
            btnStartTest.dataset.listenerAttached = 'true';
        }
    }

    /**
     * ✅ NUEVO: Oculta la sección de test
     */
    hideTestSection() {
        const testSection = document.getElementById('testSection');
        if (testSection) {
            testSection.style.display = 'none';
        }
    }

    /**
     * ✅ NUEVO: Maneja el inicio del test de usabilidad
     */
    /**
 * Maneja el inicio del test de usabilidad
 */
handleStartTest() {
    console.log('Iniciando test de usabilidad...');
    
    // Pausar el dot de seguimiento durante el test
    uiControls.hideGazeDot();
    
    // Abrir página de test con parámetro de calibración
    const testWindow = window.open('test-page.html?calibrated=true', 'WebGazerTest', 'width=1200,height=800');
    
    if (testWindow) {
        uiControls.updateStatus('Test iniciado en nueva ventana', '#27ae60');
    } else {
        uiControls.showError('No se pudo abrir la ventana del test. Verifica que los pop-ups estén habilitados.');
    }
}
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});