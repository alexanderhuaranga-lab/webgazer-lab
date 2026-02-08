// gaze-tracker.js
// Módulo para capturar y almacenar coordenadas de la mirada

class GazeTracker {
    constructor() {
        this.isRecording = false;
        this.gazeData = [];
        this.startTime = null;
        this.recordingDuration = 60000; // 60 segundos por defecto
    }

    /**
     * Inicia la grabación de coordenadas
     * @param {number} duration - Duración en milisegundos (opcional)
     */
    startRecording(duration = 60000) {
        if (this.isRecording) {
            console.warn('Ya hay una grabación en progreso');
            return;
        }

        this.isRecording = true;
        this.gazeData = [];
        this.startTime = Date.now();
        this.recordingDuration = duration;

        console.log(`Grabación iniciada por ${duration / 1000} segundos`);
    }

    /**
     * Detiene la grabación de coordenadas
     */
    stopRecording() {
        if (!this.isRecording) {
            console.warn('No hay grabación activa');
            return;
        }

        this.isRecording = false;
        console.log(`Grabación detenida. Total de puntos: ${this.gazeData.length}`);
        
        return this.gazeData;
    }

    /**
     * Registra un punto de mirada
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     */
    recordGazePoint(x, y) {
        if (!this.isRecording) return;

        const timestamp = Date.now() - this.startTime;
        
        // Solo grabar si está dentro del tiempo límite
        if (timestamp <= this.recordingDuration) {
            this.gazeData.push({
                x: Math.round(x),
                y: Math.round(y),
                timestamp: timestamp
            });
        } else {
            // Auto-detener si se acabó el tiempo
            this.stopRecording();
        }
    }

    /**
     * Obtiene los datos grabados
     * @returns {Array} Array de puntos {x, y, timestamp}
     */
    getData() {
        return this.gazeData;
    }

    /**
     * Limpia los datos almacenados
     */
    clearData() {
        this.gazeData = [];
        this.startTime = null;
        console.log('Datos limpiados');
    }

    /**
     * Verifica si está grabando
     * @returns {boolean}
     */
    isActive() {
        return this.isRecording;
    }

    /**
     * Obtiene estadísticas básicas de los datos
     * @returns {Object}
     */
    getStats() {
        if (this.gazeData.length === 0) {
            return {
                totalPoints: 0,
                duration: 0,
                avgX: 0,
                avgY: 0
            };
        }

        const totalPoints = this.gazeData.length;
        const duration = this.gazeData[this.gazeData.length - 1].timestamp;
        
        const sumX = this.gazeData.reduce((sum, point) => sum + point.x, 0);
        const sumY = this.gazeData.reduce((sum, point) => sum + point.y, 0);
        
        return {
            totalPoints: totalPoints,
            duration: duration,
            avgX: Math.round(sumX / totalPoints),
            avgY: Math.round(sumY / totalPoints),
            samplesPerSecond: Math.round((totalPoints / duration) * 1000)
        };
    }

    /**
     * Exporta los datos a JSON
     * @returns {string}
     */
    exportToJSON() {
        const data = {
            metadata: {
                recordedAt: new Date().toISOString(),
                totalPoints: this.gazeData.length,
                duration: this.recordingDuration / 1000
            },
            gazePoints: this.gazeData,
            stats: this.getStats()
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// Exportar instancia única
export const gazeTracker = new GazeTracker();