// heatmap-manager.js
// Módulo para generar y visualizar heatmaps con Heatmap.js

class HeatmapManager {
    constructor() {
        this.heatmapInstance = null;
        this.container = null;
        this.isVisible = false;
    }

    /**
     * Inicializa el heatmap
     * @param {string} containerId - ID del contenedor donde se montará el heatmap
     */
    init(containerId = 'heatmapContainer') {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`Contenedor ${containerId} no encontrado`);
            return false;
        }

        // Verificar si heatmap.js está cargado
        if (typeof h337 === 'undefined') {
            console.error('Heatmap.js no está cargado. Asegúrate de incluir el script.');
            return false;
        }

        // Configurar heatmap
        this.heatmapInstance = h337.create({
            container: this.container,
            radius: 40,
            maxOpacity: 0.6,
            minOpacity: 0,
            blur: 0.75,
            gradient: {
                '0.0': 'blue',
                '0.25': 'cyan',
                '0.5': 'lime',
                '0.75': 'yellow',
                '1.0': 'red'
            }
        });

        console.log('HeatmapManager inicializado');
        return true;
    }

    /**
     * Genera el heatmap a partir de datos de mirada
     * @param {Array} gazeData - Array de puntos {x, y, timestamp}
     */
    generateHeatmap(gazeData) {
        if (!this.heatmapInstance) {
            console.error('Heatmap no inicializado. Llama a init() primero.');
            return;
        }

        if (!gazeData || gazeData.length === 0) {
            console.warn('No hay datos de mirada para generar el heatmap');
            return;
        }

        // Transformar datos al formato de heatmap.js
        const heatmapData = {
            max: this.calculateMaxValue(gazeData),
            data: this.transformGazeData(gazeData)
        };

        // Establecer datos en el heatmap
        this.heatmapInstance.setData(heatmapData);
        
        console.log(`Heatmap generado con ${gazeData.length} puntos`);
    }

    /**
     * Transforma los datos de mirada al formato de heatmap.js
     * @param {Array} gazeData
     * @returns {Array}
     */
    transformGazeData(gazeData) {
        // Agrupar puntos cercanos para evitar ruido
        const gridSize = 20; // Tamaño de la celda en píxeles
        const heatmap = {};

        gazeData.forEach(point => {
            const gridX = Math.floor(point.x / gridSize) * gridSize;
            const gridY = Math.floor(point.y / gridSize) * gridSize;
            const key = `${gridX},${gridY}`;

            if (!heatmap[key]) {
                heatmap[key] = { x: gridX, y: gridY, value: 0 };
            }
            heatmap[key].value += 1;
        });

        return Object.values(heatmap);
    }

    /**
     * Calcula el valor máximo para normalización
     * @param {Array} gazeData
     * @returns {number}
     */
    calculateMaxValue(gazeData) {
        const gridSize = 20;
        const counts = {};
        
        gazeData.forEach(point => {
            const key = `${Math.floor(point.x / gridSize)},${Math.floor(point.y / gridSize)}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        return Math.max(...Object.values(counts));
    }

    /**
     * Muestra el heatmap
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.isVisible = true;
        }
    }

    /**
     * Oculta el heatmap
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }

    /**
     * Alterna la visibilidad del heatmap
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Limpia el heatmap
     */
    clear() {
        if (this.heatmapInstance) {
            this.heatmapInstance.setData({ max: 0, data: [] });
        }
    }

    /**
     * Destruye la instancia del heatmap
     */
    destroy() {
        if (this.heatmapInstance) {
            this.clear();
            this.heatmapInstance = null;
        }
    }

    /**
     * Obtiene zonas de mayor atención (hotspots)
     * @param {Array} gazeData
     * @param {number} topN - Número de zonas a retornar
     * @returns {Array}
     */
    getHotspots(gazeData, topN = 5) {
        const transformed = this.transformGazeData(gazeData);
        
        // Ordenar por valor descendente
        const sorted = transformed.sort((a, b) => b.value - a.value);
        
        return sorted.slice(0, topN).map((point, index) => ({
            rank: index + 1,
            x: point.x,
            y: point.y,
            fixations: point.value,
            percentage: ((point.value / gazeData.length) * 100).toFixed(2)
        }));
    }
}

// Exportar instancia única
export const heatmapManager = new HeatmapManager();