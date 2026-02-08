// calibration.js
// Módulo para manejar la calibración de 9 puntos

class Calibration {
    constructor() {
        this.isCalibrating = false;
        this.isValidating = false;
        this.currentPoint = 0;
        this.totalPoints = 9;
        this.validationPoints = 5; // Puntos para validación
        this.calibrationPoints = [];
        this.validationData = [];
        this.container = null;
        this.point = null;
        this.progressText = null;
        
        // Generar posiciones
        this.generateCalibrationPoints();
        this.generateValidationPoints();
    }

    /**
     * Genera las posiciones de los 9 puntos de calibración
     */
    generateCalibrationPoints() {
        const marginX = 10;
        const marginY = 10;
        
        const positions = [
            { x: marginX, y: marginY },
            { x: 50, y: marginY },
            { x: 100 - marginX, y: marginY },
            { x: marginX, y: 50 },
            { x: 50, y: 50 },
            { x: 100 - marginX, y: 50 },
            { x: marginX, y: 100 - marginY },
            { x: 50, y: 100 - marginY },
            { x: 100 - marginX, y: 100 - marginY }
        ];
        
        this.calibrationPoints = positions;
    }

    /**
     * Genera puntos de validación (diferentes a calibración)
     */
    generateValidationPoints() {
        // Puntos intermedios entre los de calibración
        const positions = [
            { x: 25, y: 25 },   // Entre punto 1 y 5
            { x: 75, y: 25 },   // Entre punto 2 y 6
            { x: 25, y: 75 },   // Entre punto 4 y 8
            { x: 75, y: 75 },   // Entre punto 5 y 9
            { x: 50, y: 50 }    // Centro (para confirmar)
        ];
        
        this.validationData = positions.map(pos => ({
            position: pos,
            actualX: 0,
            actualY: 0,
            predictedX: 0,
            predictedY: 0,
            error: 0
        }));
    }

    /**
     * Inicializa referencias a elementos del DOM
     */
    init() {
        this.container = document.getElementById('calibrationContainer');
        this.point = document.getElementById('calibrationPoint');
        this.progressText = document.getElementById('calibrationProgress');
        
        // Event listener para clicks en el punto
        this.point.addEventListener('click', () => {
            this.onPointClick();
        });
        
        console.log('Calibration inicializado');
    }

    /**
     * Inicia el proceso de calibración
     */
    start() {
        if (this.isCalibrating) {
            console.log('Calibración ya en progreso');
            return;
        }
        
        this.isCalibrating = true;
        this.isValidating = false;
        this.currentPoint = 0;
        
        // Mostrar contenedor de calibración
        this.container.classList.remove('hidden');
        
        // Actualizar instrucciones
        this.updateInstructions('Mira fijamente cada punto y haz click cuando aparezca');
        
        // Mostrar primer punto
        this.showPoint(this.currentPoint);
        
        console.log('Calibración iniciada');
    }

    /**
     * Muestra un punto de calibración en pantalla
     */
    showPoint(index) {
        if (index >= this.totalPoints) {
            // Calibración completa, iniciar validación
            this.startValidation();
            return;
        }
        
        const position = this.calibrationPoints[index];
        
        const x = (window.innerWidth * position.x) / 100;
        const y = (window.innerHeight * position.y) / 100;
        
        this.point.style.left = `${x}px`;
        this.point.style.top = `${y}px`;
        
        this.updateProgress();
        
        console.log(`Mostrando punto ${index + 1}/${this.totalPoints}`);
    }

    /**
     * Maneja el click en un punto de calibración
     */
    onPointClick() {
        if (!this.isCalibrating || this.isValidating) return;
        
        console.log(`Punto ${this.currentPoint + 1} clickeado`);
        
        this.currentPoint++;
        
        setTimeout(() => {
            this.showPoint(this.currentPoint);
        }, 300);
    }

    /**
     * Inicia la fase de validación
     */
    startValidation() {
        console.log('Iniciando validación de precisión...');
        
        this.isValidating = true;
        this.currentPoint = 0;
        
        // Cambiar instrucciones
        this.updateInstructions('¡Solo MIRA cada punto! No hagas click. Midiendo precisión...');
        
        // Cambiar estilo del punto (solo visual, no clickeable)
        this.point.style.cursor = 'default';
        this.point.style.backgroundColor = '#27ae60'; // Verde para validación
        
        // Mostrar primer punto de validación
        this.showValidationPoint(this.currentPoint);
    }

    /**
     * Muestra un punto de validación
     */
    showValidationPoint(index) {
        if (index >= this.validationPoints) {
            // Validación completa
            this.finishValidation();
            return;
        }
        
        const validationItem = this.validationData[index];
        const position = validationItem.position;
        
        const x = (window.innerWidth * position.x) / 100;
        const y = (window.innerHeight * position.y) / 100;
        
        // Guardar posición real
        validationItem.actualX = x;
        validationItem.actualY = y;
        
        this.point.style.left = `${x}px`;
        this.point.style.top = `${y}px`;
        
        // Actualizar progreso
        if (this.progressText) {
            this.progressText.textContent = `Validación ${index + 1}/${this.validationPoints}`;
        }
        
        // Esperar 2 segundos para capturar predicción
        setTimeout(() => {
            this.captureValidationData(index);
        }, 2000);
    }

    /**
     * Captura los datos de predicción para validación
     */
    captureValidationData(index) {
        // Obtener predicción actual de WebGazer
        const prediction = webgazer.getCurrentPrediction();
        
        if (prediction) {
            const validationItem = this.validationData[index];
            validationItem.predictedX = prediction.x;
            validationItem.predictedY = prediction.y;
            
            // Calcular error euclidiano
            const dx = validationItem.actualX - validationItem.predictedX;
            const dy = validationItem.actualY - validationItem.predictedY;
            validationItem.error = Math.sqrt(dx * dx + dy * dy);
            
            console.log(`Validación ${index + 1}: Error = ${Math.round(validationItem.error)}px`);
        } else {
            console.warn(`No se pudo obtener predicción para punto ${index + 1}`);
            this.validationData[index].error = -1; // Error desconocido
        }
        
        // Avanzar al siguiente punto
        this.currentPoint++;
        this.showValidationPoint(this.currentPoint);
    }

    /**
     * Finaliza la validación y calcula métricas
     */
    finishValidation() {
        console.log('Validación completada');
        
        // Calcular métricas
        const metrics = this.calculateMetrics();
        
        // Mostrar resultados
        this.showResults(metrics);
        
        // Después de 5 segundos, cerrar
        setTimeout(() => {
            this.finish(metrics);
        }, 5000);
    }

    /**
     * Calcula las métricas de precisión
     */
    calculateMetrics() {
        const validErrors = this.validationData
            .filter(item => item.error >= 0)
            .map(item => item.error);
        
        if (validErrors.length === 0) {
            return {
                avgErrorPx: 0,
                avgErrorCm: 0,
                maxErrorPx: 0,
                minErrorPx: 0,
                accuracy: 'No disponible'
            };
        }
        
        const avgErrorPx = validErrors.reduce((a, b) => a + b, 0) / validErrors.length;
        
        // Convertir a cm (asumiendo ~96 DPI y distancia estándar de 60cm)
        // 1 px ≈ 0.026 cm en pantalla típica
        const avgErrorCm = avgErrorPx * 0.026;
        
        const maxErrorPx = Math.max(...validErrors);
        const minErrorPx = Math.min(...validErrors);
        
        // Clasificación de precisión
        let accuracy = 'Excelente';
        if (avgErrorPx > 150) accuracy = 'Pobre';
        else if (avgErrorPx > 100) accuracy = 'Regular';
        else if (avgErrorPx > 50) accuracy = 'Buena';
        
        return {
            avgErrorPx: Math.round(avgErrorPx),
            avgErrorCm: avgErrorCm.toFixed(2),
            maxErrorPx: Math.round(maxErrorPx),
            minErrorPx: Math.round(minErrorPx),
            accuracy: accuracy
        };
    }

    /**
     * Muestra los resultados de validación
     */
    showResults(metrics) {
        const instructionsEl = document.querySelector('.calibration-instructions h2');
        const descriptionEl = document.querySelector('.calibration-instructions p');
        
        if (instructionsEl && descriptionEl) {
            instructionsEl.textContent = '✓ Calibración Completada';
            descriptionEl.innerHTML = `
                <strong>Resultados de Precisión:</strong><br>
                Error promedio: ${metrics.avgErrorPx}px (~${metrics.avgErrorCm}cm)<br>
                Rango: ${metrics.minErrorPx}px - ${metrics.maxErrorPx}px<br>
                Calidad: <strong>${metrics.accuracy}</strong>
            `;
        }
        
        console.log('Métricas de calibración:', metrics);
    }

    /**
     * Actualiza las instrucciones en pantalla
     */
    updateInstructions(text) {
        const instructionsEl = document.querySelector('.calibration-instructions p');
        if (instructionsEl) {
            instructionsEl.textContent = text;
        }
    }

    /**
     * Actualiza el texto de progreso
     */
    updateProgress() {
        if (this.progressText) {
            this.progressText.textContent = `${this.currentPoint}/${this.totalPoints}`;
        }
    }

    /**
     * Finaliza el proceso completo
     */
   /**
 * Finaliza el proceso completo
 */
finish(metrics = null) {
    console.log('Proceso completo finalizado');
    
    this.isCalibrating = false;
    this.isValidating = false;
    
    // Restaurar estilo del punto
    this.point.style.cursor = 'pointer';
    this.point.style.backgroundColor = '#3498db';
    
    // NUEVO: Forzar guardado de datos de WebGazer
    if (typeof webgazer !== 'undefined') {
        try {
            // Forzar guardado explícito
            webgazer.saveDataAcrossSessions(true);
            console.log('Datos de calibración guardados en localStorage');
            
            // Verificar que se guardó
            setTimeout(() => {
                const saved = localStorage.getItem('webgazerGlobalData');
                console.log('Verificación de guardado:', saved ? 'ÉXITO' : 'FALLO');
            }, 500);
        } catch (error) {
            console.error('Error guardando datos:', error);
        }
    }
    
    // Ocultar contenedor
    this.container.classList.add('hidden');
    
    // Callback con métricas
    if (this.onComplete) {
        this.onComplete(metrics);
    }
}

    /**
     * Cancela la calibración
     */
    cancel() {
        if (!this.isCalibrating) return;
        
        console.log('Calibración cancelada');
        
        this.isCalibrating = false;
        this.isValidating = false;
        this.container.classList.add('hidden');
        
        if (this.onCancel) {
            this.onCancel();
        }
    }

    /**
     * Verifica si está activo (calibrando o validando)
     */
    isActive() {
        return this.isCalibrating || this.isValidating;
    }

    /**
     * Configura callback para cuando termine
     */
    setOnComplete(callback) {
        this.onComplete = callback;
    }

    /**
     * Configura callback para cuando se cancele
     */
    setOnCancel(callback) {
        this.onCancel = callback;
    }
}

// Exportar instancia única
export const calibration = new Calibration();