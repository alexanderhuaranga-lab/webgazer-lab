// webgazer-manager.js
// Módulo para manejar la API de WebGazer

class WebGazerManager {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.gazeListener = null;
    }

    /**
     * Inicializa WebGazer con configuración básica
     */
    async init() {
        try {
            webgazer.params.showVideo = true;
            webgazer.params.showFaceOverlay = true;
            webgazer.params.showFaceFeedbackBox = true;
            
            webgazer.setRegression('ridge');
            webgazer.setTracker('TFFacemesh');
            
            // CRÍTICO: Habilitar guardado automático
            webgazer.saveDataAcrossSessions(true);
            
            this.isInitialized = true;
            console.log('WebGazer inicializado correctamente');
            console.log('saveDataAcrossSessions:', true);
            
            return true;
        } catch (error) {
            console.error('Error al inicializar WebGazer:', error);
            return false;
        }
    }

    /**
     * Inicia la recolección de datos y predicciones
     */
    async start() {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            await webgazer.begin();
            this.isRunning = true;
            
            // Mover video al contenedor (tiempo reducido)
            this.moveVideoToContainer();
            
            console.log('WebGazer iniciado');
            
            return true;
        } catch (error) {
            console.error('Error al iniciar WebGazer:', error);
            return false;
        }
    }

    /**
     * Mueve el video de WebGazer al contenedor personalizado
     */
    moveVideoToContainer() {
        // Intentar mover inmediatamente
        const attemptMove = () => {
            const videoFeed = document.getElementById('webgazerVideoFeed');
            const faceOverlay = document.getElementById('webgazerFaceOverlay');
            const faceFeedbackBox = document.getElementById('webgazerFaceFeedbackBox');
            const cameraContainer = document.getElementById('cameraContainer');
            
            if (videoFeed && cameraContainer) {
                // Ocultar placeholder
                const placeholder = cameraContainer.querySelector('.camera-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // Mover elementos al contenedor
                cameraContainer.appendChild(videoFeed);
                
                if (faceOverlay) {
                    cameraContainer.appendChild(faceOverlay);
                }
                
                if (faceFeedbackBox) {
                    cameraContainer.appendChild(faceFeedbackBox);
                }
                
                console.log('Video movido al contenedor');
                return true;
            }
            return false;
        };
        
        // Intentar varias veces con delays cortos
        setTimeout(() => {
            if (!attemptMove()) {
                setTimeout(attemptMove, 100);
            }
        }, 200);
    }

    /**
     * Detiene WebGazer completamente
     */
    stop() {
        if (this.isRunning) {
            webgazer.end();
            
            this.isRunning = false;
            this.isInitialized = false;
            
            // Limpiar elementos del DOM
            this.cleanupVideoElements();
            
            console.log('WebGazer detenido');
        }
    }

    /**
     * Limpia los elementos de video del DOM
     */
    /**
 * Limpia los elementos de video del DOM y detiene la cámara
 */
cleanupVideoElements() {
    const cameraContainer = document.getElementById('cameraContainer');
    
    if (cameraContainer) {
        const videoFeed = document.getElementById('webgazerVideoFeed');
        const faceOverlay = document.getElementById('webgazerFaceOverlay');
        const faceFeedbackBox = document.getElementById('webgazerFaceFeedbackBox');
        
        // Detener el stream de video de la cámara
        if (videoFeed && videoFeed.srcObject) {
            const stream = videoFeed.srcObject;
            const tracks = stream.getTracks();
            
            tracks.forEach(track => {
                track.stop();
                console.log('Track de cámara detenido:', track.kind);
            });
            
            videoFeed.srcObject = null;
        }
        
        // Remover elementos del contenedor
        if (videoFeed && videoFeed.parentNode === cameraContainer) {
            cameraContainer.removeChild(videoFeed);
        }
        
        if (faceOverlay && faceOverlay.parentNode === cameraContainer) {
            cameraContainer.removeChild(faceOverlay);
        }
        
        if (faceFeedbackBox && faceFeedbackBox.parentNode === cameraContainer) {
            cameraContainer.removeChild(faceFeedbackBox);
        }
        
        // Mostrar placeholder nuevamente
        const placeholder = cameraContainer.querySelector('.camera-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
    }
    
    // Remover cualquier elemento huérfano de WebGazer en el body
    setTimeout(() => {
        const orphanVideo = document.getElementById('webgazerVideoFeed');
        const orphanOverlay = document.getElementById('webgazerFaceOverlay');
        const orphanFeedback = document.getElementById('webgazerFaceFeedbackBox');
        
        if (orphanVideo) {
            // Detener stream si existe
            if (orphanVideo.srcObject) {
                const tracks = orphanVideo.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            orphanVideo.remove();
        }
        if (orphanOverlay) orphanOverlay.remove();
        if (orphanFeedback) orphanFeedback.remove();
    }, 100);
}

    /**
     * Pausa la recolección de datos
     */
    pause() {
        if (this.isRunning) {
            webgazer.pause();
            console.log('WebGazer pausado');
        }
    }

    /**
     * Reanuda la recolección de datos
     */
    resume() {
        if (this.isRunning) {
            webgazer.resume();
            console.log('WebGazer reanudado');
        }
    }

    /**
     * Configura el listener para recibir predicciones de la mirada
     */
    setGazeListener(callback) {
        this.gazeListener = callback;
        
        webgazer.setGazeListener((data, elapsedTime) => {
            if (data == null) {
                return;
            }
            
            if (this.gazeListener) {
                this.gazeListener(data, elapsedTime);
            }
        });
    }

    /**
     * Obtiene una predicción en el momento actual
     */
    getCurrentPrediction() {
        const prediction = webgazer.getCurrentPrediction();
        return prediction;
    }

    /**
     * Verifica si WebGazer está corriendo
     */
    isActive() {
        return this.isRunning;
    }
}

// Exportar instancia única
export const webGazerManager = new WebGazerManager();