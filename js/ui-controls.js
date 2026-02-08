// ui-controls.js
// Módulo para manejar la interfaz de usuario y controles

class UIControls {
    constructor() {
        this.btnStart = null;
        this.btnCalibrate = null;
        this.btnStop = null;
        this.statusText = null;
        this.gazeDot = null;
    }

    /**
     * Inicializa referencias a elementos del DOM
     */
    init() {
        // Obtener referencias a elementos
        this.btnStart = document.getElementById('btnStart');
        this.btnCalibrate = document.getElementById('btnCalibrate');
        this.btnStop = document.getElementById('btnStop');
        this.statusText = document.getElementById('statusText');
        this.gazeDot = document.getElementById('gazeDot');

        console.log('UIControls inicializado');
    }

    /**
     * Actualiza el texto de estado
     * @param {string} text - Texto del estado
     * @param {string} color - Color del texto (opcional)
     */
    updateStatus(text, color = '#3498db') {
        if (this.statusText) {
            this.statusText.textContent = text;
            this.statusText.style.color = color;
        }
    }

    /**
     * Actualiza el estado de los botones
     * @param {boolean} isRunning - Si WebGazer está corriendo
     * @param {boolean} isCalibrating - Si está en proceso de calibración
     */
    updateButtons(isRunning, isCalibrating = false) {
        if (this.btnStart && this.btnCalibrate && this.btnStop) {
            // Botón Iniciar: deshabilitado si está corriendo
            this.btnStart.disabled = isRunning;
            
            // Botón Calibrar: habilitado solo si está corriendo y NO calibrando
            this.btnCalibrate.disabled = !isRunning || isCalibrating;
            
            // Botón Detener: habilitado solo si está corriendo
            this.btnStop.disabled = !isRunning;
        }
    }

    /**
     * Muestra el dot de seguimiento de mirada
     */
    showGazeDot() {
        if (this.gazeDot) {
            this.gazeDot.classList.add('active');
        }
    }

    /**
     * Oculta el dot de seguimiento de mirada
     */
    hideGazeDot() {
        if (this.gazeDot) {
            this.gazeDot.classList.remove('active');
        }
    }

    /**
     * Actualiza la posición del dot de seguimiento
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     */
    updateGazeDotPosition(x, y) {
        if (this.gazeDot) {
            this.gazeDot.style.left = `${x}px`;
            this.gazeDot.style.top = `${y}px`;
        }
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.updateStatus(`Error: ${message}`, '#e74c3c');
    }

    /**
     * Muestra un mensaje de éxito
     * @param {string} message - Mensaje de éxito
     */
    showSuccess(message) {
        this.updateStatus(message, '#27ae60');
    }

    /**
     * Muestra un mensaje de advertencia
     * @param {string} message - Mensaje de advertencia
     */
    showWarning(message) {
        this.updateStatus(message, '#f39c12');
    }
}

// Exportar instancia única
export const uiControls = new UIControls();