// results-controller.js
// Controlador para mostrar resultados del test

class ResultsController {
    constructor() {
        this.testResults = null;
    }

    /**
     * Inicializa el controlador de resultados
     */
    init() {
        console.log('ResultsController inicializado');
        
        // Cargar datos del test
        this.loadTestData();
        
        // Mostrar resultados
        if (this.testResults) {
            this.displayResults();
            this.setupEventListeners();
        } else {
            this.showError();
        }
    }

    /**
     * Carga los datos del test desde sessionStorage
     */
    loadTestData() {
        try {
            const data = sessionStorage.getItem('testResults');
            if (data) {
                this.testResults = JSON.parse(data);
                console.log('Datos cargados:', this.testResults);
            } else {
                console.error('No se encontraron datos del test');
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    /**
     * Muestra los resultados en la página
     */
    displayResults() {
        const { reason, details, taskCompleted, gazeData, stats } = this.testResults;
        
        // Estado del test
        const statusEl = document.getElementById('testStatus');
        if (statusEl) {
            if (reason === 'completed') {
                statusEl.textContent = 'Completado';
                statusEl.style.color = '#27ae60';
            } else {
                statusEl.textContent = 'Tiempo agotado';
                statusEl.style.color = '#e74c3c';
            }
        }
        
        // Duración
        const durationEl = document.getElementById('testDuration');
        if (durationEl && stats) {
            const seconds = Math.round(stats.duration / 1000);
            durationEl.textContent = `${seconds}s`;
        }
        
        // Total de puntos
        const pointsEl = document.getElementById('totalPoints');
        if (pointsEl && stats) {
            pointsEl.textContent = stats.totalPoints;
        }
        
        // Coordenada promedio
        const avgCoordsEl = document.getElementById('avgCoords');
        if (avgCoordsEl && stats) {
            avgCoordsEl.textContent = `(${Math.round(stats.avgX)}, ${Math.round(stats.avgY)})`;
        }
        
        // Muestras por segundo
        const samplesEl = document.getElementById('samplesPerSec');
        if (samplesEl && stats) {
            samplesEl.textContent = `${Math.round(stats.samplesPerSecond)} puntos/s`;
        }
        
        // Tarea completada
        const taskStatusEl = document.getElementById('taskStatus');
        if (taskStatusEl) {
            if (taskCompleted) {
                taskStatusEl.textContent = `Sí - ${details}`;
                taskStatusEl.style.color = '#27ae60';
            } else {
                taskStatusEl.textContent = 'No completada';
                taskStatusEl.style.color = '#e74c3c';
            }
        }
        
        // Análisis automático
        this.generateAutoAnalysis();
        
        // Mostrar hotspots
        this.displayHotspots();
        
        // Cargar página de test en iframe
        this.loadTestPageInIframe();
        
        // Dibujar heatmap encima (con delay para que cargue el iframe)
        setTimeout(() => {
            this.drawSimpleHeatmap();
        }, 500);
        
        console.log('Resultados mostrados correctamente');
    }

    /**
     * Genera análisis automático básico
     */
    generateAutoAnalysis() {
        const autoAnalysisEl = document.getElementById('autoAnalysis');
        if (!autoAnalysisEl) return;
        
        const { taskCompleted, stats, gazeData } = this.testResults;
        
        let analysis = '';
        
        // Análisis de completitud
        if (taskCompleted) {
            analysis += '<p><strong>Tarea completada exitosamente.</strong> El usuario logró identificar y hacer clic en el CTA principal.</p>';
        } else {
            analysis += '<p><strong>Tarea no completada.</strong> El usuario no logró encontrar el botón objetivo en el tiempo establecido.</p>';
        }
        
        // Análisis de actividad
        if (stats && stats.totalPoints > 0) {
            const activity = stats.samplesPerSecond;
            if (activity > 20) {
                analysis += '<p>Alta actividad de exploración visual detectada.</p>';
            } else if (activity > 10) {
                analysis += '<p>Actividad de exploración moderada.</p>';
            } else {
                analysis += '<p>Baja actividad de exploración visual.</p>';
            }
        }
        
        // Análisis de tiempo
        if (stats && stats.duration) {
            const seconds = Math.round(stats.duration / 1000);
            if (taskCompleted && seconds < 15) {
                analysis += '<p>El usuario encontró el objetivo rápidamente, indicando buena visibilidad del CTA.</p>';
            } else if (taskCompleted && seconds > 30) {
                analysis += '<p>El usuario tardó en encontrar el objetivo, sugiriendo que la jerarquía visual podría mejorarse.</p>';
            }
        }
        
        // Método de tracking
        if (this.testResults.trackingMethod === 'mouse') {
            analysis += '<p><em>Nota: Los datos fueron capturados mediante mouse tracking como aproximación a eye tracking.</em></p>';
        }
        
        autoAnalysisEl.innerHTML = analysis;
    }

    /**
     * Genera y muestra las zonas de mayor atención
     */
    displayHotspots() {
        const hotspotsList = document.getElementById('hotspotsList');
        if (!hotspotsList) return;
        
        const { gazeData } = this.testResults;
        if (!gazeData || gazeData.length === 0) {
            hotspotsList.innerHTML = '<p>No hay suficientes datos para calcular zonas de atención.</p>';
            return;
        }
        
        // Calcular hotspots (zonas más visitadas)
        const hotspots = this.calculateHotspots(gazeData);
        
        // Mostrar top 5
        hotspotsList.innerHTML = '';
        hotspots.slice(0, 5).forEach((hotspot, index) => {
            const item = document.createElement('div');
            item.className = 'hotspot-item';
            item.innerHTML = `
                <div class="hotspot-rank">${index + 1}</div>
                <div class="hotspot-coords">
                    Coordenadas: (${hotspot.x}, ${hotspot.y})
                </div>
                <div class="hotspot-percentage">
                    ${hotspot.percentage}% de atención
                </div>
            `;
            hotspotsList.appendChild(item);
        });
    }

    /**
     * Calcula las zonas de mayor atención
     */
    calculateHotspots(gazeData) {
        const gridSize = 100; // Dividir pantalla en cuadrículas de 100px
        const grid = {};
        
        // Agrupar puntos en cuadrícula
        gazeData.forEach(point => {
            const gridX = Math.floor(point.x / gridSize) * gridSize;
            const gridY = Math.floor(point.y / gridSize) * gridSize;
            const key = `${gridX},${gridY}`;
            
            if (!grid[key]) {
                grid[key] = { x: gridX, y: gridY, count: 0 };
            }
            grid[key].count++;
        });
        
        // Convertir a array y ordenar
        const hotspots = Object.values(grid)
            .map(cell => ({
                x: cell.x,
                y: cell.y,
                count: cell.count,
                percentage: ((cell.count / gazeData.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count);
        
        return hotspots;
    }

    /**
     * Carga test-page.html en el iframe
     */
    loadTestPageInIframe() {
        const iframe = document.getElementById('testPageFrame');
        if (iframe) {
            iframe.src = 'test-page-static.html'; // Cambio: usar versión estática
            iframe.style.display = 'block';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.pointerEvents = 'none'; // Evitar interacción con el iframe
            
            console.log('test-page-static.html cargado en iframe');
        }
    }

    /**
     * Dibuja un mapa de calor simple
     */
    drawSimpleHeatmap() {
        const container = document.querySelector('.heatmap-wrapper');
        if (!container) return;
        
        const { gazeData } = this.testResults;
        if (!gazeData || gazeData.length === 0) return;
        
        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = container.offsetWidth || 1200;
        canvas.height = container.offsetHeight || 600;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10';
        
        const ctx = canvas.getContext('2d');
        
        // Dibujar puntos con gradiente radial
        gazeData.forEach(point => {
            const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 30);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(point.x - 30, point.y - 30, 60, 60);
        });
        
        // Agregar al contenedor
        const heatmapOverlay = document.getElementById('heatmapContainer');
        if (heatmapOverlay) {
            heatmapOverlay.innerHTML = '';
            heatmapOverlay.appendChild(canvas);
        }
        
        console.log(`Heatmap dibujado con ${gazeData.length} puntos`);
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botón exportar datos
        const btnExport = document.getElementById('btnExportData');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Botón nuevo test
        const btnNewTest = document.getElementById('btnNewTest');
        if (btnNewTest) {
            btnNewTest.addEventListener('click', () => {
                sessionStorage.removeItem('testResults');
                window.location.href = 'index.html';
            });
        }
        
        // Botón volver al lab
        const btnBackToLab = document.getElementById('btnBackToLab');
        if (btnBackToLab) {
            btnBackToLab.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // Botón guardar análisis
        const btnSaveAnalysis = document.getElementById('btnSaveAnalysis');
        if (btnSaveAnalysis) {
            btnSaveAnalysis.addEventListener('click', () => {
                this.saveAnalysis();
            });
        }
        
        // Botón toggle heatmap
        const btnToggleHeatmap = document.getElementById('btnToggleHeatmap');
        if (btnToggleHeatmap) {
            btnToggleHeatmap.addEventListener('click', () => {
                this.toggleHeatmap();
            });
        }
    }

    /**
     * Alterna visibilidad del heatmap
     */
    toggleHeatmap() {
        const heatmapContainer = document.getElementById('heatmapContainer');
        const btnToggle = document.getElementById('btnToggleHeatmap');
        
        if (!heatmapContainer || !btnToggle) return;
        
        if (heatmapContainer.style.display === 'none') {
            heatmapContainer.style.display = 'block';
            btnToggle.textContent = 'Ocultar Heatmap';
        } else {
            heatmapContainer.style.display = 'none';
            btnToggle.textContent = 'Mostrar Heatmap';
        }
    }

    /**
     * Exporta los datos a JSON
     */
    exportData() {
        const dataStr = JSON.stringify(this.testResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `test-results-${new Date().getTime()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('Datos exportados');
        alert('Datos exportados exitosamente como JSON');
    }

    /**
     * Guarda el análisis manual
     */
    saveAnalysis() {
        const textarea = document.getElementById('manualAnalysis');
        if (!textarea) return;
        
        const analysis = textarea.value;
        
        if (!analysis.trim()) {
            alert('Por favor, escribe tu análisis antes de guardar.');
            return;
        }
        
        // Guardar en el objeto de resultados
        this.testResults.manualAnalysis = analysis;
        this.testResults.analysisSavedAt = new Date().toISOString();
        
        // Actualizar sessionStorage
        sessionStorage.setItem('testResults', JSON.stringify(this.testResults));
        
        alert('Análisis guardado correctamente. Puedes exportar los datos completos usando el botón "Exportar Datos (JSON)".');
        
        console.log('Análisis guardado');
    }

    /**
     * Muestra error si no hay datos
     */
    showError() {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 100px 20px;">
                    <h2>Error</h2>
                    <p style="color: #e74c3c; margin: 20px 0;">
                        Por favor, inicia el test desde el laboratorio después de calibrar.
                    </p>
                    <button onclick="window.location.href='index.html'" 
                            style="padding: 12px 24px; background: #3498db; color: white; 
                                   border: none; border-radius: 6px; cursor: pointer;">
                        Volver al Laboratorio
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ResultsController();
    controller.init();
});