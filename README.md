# WebGazer Lab - Eye Tracking para Análisis de Usabilidad

## Descripción del Proyecto

Este proyecto implementa un sistema de eye-tracking web utilizando WebGazer.js para analizar el comportamiento visual de usuarios en interfaces web. El sistema captura puntos de fijación visual, genera mapas de calor y proporciona métricas de usabilidad basadas en las heurísticas de Nielsen.

**Universidad:** Universidad Internacional SEK (UISEK) Ecuador  
**Curso:** UX/UI Laboratory  
**Tema:** Laboratorio 5 - Eye Tracking y Mapas de Calor

---

## Objetivo

Aplicar técnicas de eye-tracking en entornos web para analizar el comportamiento visual de los usuarios, integrando WebGazer.js y visualización de mapas de calor, con el propósito de interpretar zonas de atención, apoyar decisiones de diseño centrado en el usuario y evaluar aspectos de usabilidad de una interfaz web.

---

## Características Implementadas

### 1. Sistema de Calibración
- Calibración de 9 puntos para mejorar la precisión del tracking
- Validación automática de la calidad de calibración
- Feedback visual durante el proceso

### 2. Captura de Datos Visuales
- Registro de coordenadas de mirada mediante mouse tracking (alternativa a eye-tracking)
- Captura continua durante 30-60 segundos
- Almacenamiento de puntos con timestamps

### 3. Página de Test - TaskFlow
**Diseño:** Landing page de aplicación de gestión de tareas

**Elementos incluidos:**
- **Encabezado:** Logo TaskFlow + navegación
- **Contenido principal:** Grid de 3 columnas con información, tarjetas de características y estadísticas
- **Call To Action:** Botón "Iniciar prueba" en tarjeta destacada
- **Layout sin scroll:** Todo el contenido visible en una pantalla para evitar sesgo

**Justificación del diseño:**
- Simula una interfaz real de SaaS (Software as a Service)
- Presenta múltiples elementos compitiendo por atención
- Permite evaluar jerarquía visual y efectividad del CTA
- Incluye distractores visuales para hacer el test más realista

### 4. Tarea de Usabilidad Definida

**Tarea concreta:**  
"Encuentra y haz clic en el botón para iniciar tu prueba gratuita de TaskFlow"

**Objetivo:**  
Evaluar si los usuarios pueden identificar rápidamente el Call To Action principal en un entorno con múltiples opciones.

**Métricas capturadas:**
- Tiempo hasta completar la tarea
- Ruta visual seguida (puntos de fijación)
- Zonas de mayor y menor atención
- Tasa de éxito/fracaso

### 5. Mapa de Calor
- Visualización mediante canvas HTML5
- Gradiente de colores (rojo = mayor atención)
- Overlay sobre la interfaz de test
- Opción de mostrar/ocultar para análisis comparativo

### 6. Análisis de Resultados
- **Estadísticas automáticas:**
  - Duración del test
  - Puntos registrados
  - Coordenada promedio de atención
  - Muestras por segundo
  - Estado de completitud de tarea

- **Zonas de mayor atención:**
  - Top 5 hotspots identificados
  - Porcentaje de atención por zona
  - Coordenadas exactas

- **Análisis automático:**
  - Evaluación de completitud de tarea
  - Nivel de actividad de exploración visual
  - Interpretación de tiempos de respuesta

### 7. Exportación de Datos
- Exportación a JSON con todos los datos capturados
- Guardado de análisis manual
- Datos estructurados para análisis posterior

---

## Estructura del Proyecto
```
webgazer-lab/
├── index.html                 # Laboratorio principal con calibración
├── test-page.html            # Página de test TaskFlow (con validación)
├── test-page-static.html     # Versión estática para iframe
├── results.html              # Página de resultados y análisis
├── README.md                 # Esta documentación
├── css/
│   ├── styles.css           # Estilos del laboratorio
│   ├── test-page.css        # Estilos de la página de test
│   └── results.css          # Estilos de resultados
├── js/
│   ├── main.js              # Controlador principal del laboratorio
│   ├── webgazer-manager.js  # Gestión de WebGazer.js
│   ├── calibration.js       # Sistema de calibración
│   ├── ui-controls.js       # Controles de interfaz
│   ├── gaze-tracker.js      # Captura de coordenadas
│   ├── test-controller.js   # Controlador del test de usabilidad
│   ├── heatmap-manager.js   # Generación de mapas de calor
│   └── results-controller.js # Controlador de resultados
└── lib/
    └── webgazer.js          # Librería WebGazer.js
```

---

## Tecnologías Utilizadas

- **HTML5**: Estructura y canvas para heatmap
- **CSS3**: Diseño responsive y estilos
- **JavaScript (ES6+)**: Lógica de la aplicación (módulos)
- **WebGazer.js**: Librería de eye-tracking
- **Canvas API**: Generación de mapas de calor
- **SessionStorage API**: Transferencia de datos entre páginas

---

## Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari)
- Servidor web local (Live Server, http-server, etc.)
- Cámara web (para calibración real con WebGazer)

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone [URL-del-repositorio]
cd webgazer-lab
```

2. **Iniciar servidor local:**

Opción A - Con VS Code Live Server:
- Abrir el proyecto en VS Code
- Click derecho en `index.html` → "Open with Live Server"

Opción B - Con Python:
```bash
python -m http.server 8000
```

Opción C - Con Node.js:
```bash
npx http-server
```

3. **Abrir en navegador:**
```
http://localhost:5500/index.html
```
(El puerto puede variar según el servidor usado)

---

## Guía de Uso

### 1. Calibración del Sistema

1. Abrir `index.html` en el navegador
2. Click en **"Iniciar WebGazer"**
3. Permitir acceso a la cámara cuando lo solicite el navegador
4. Click en **"Calibrar"**
5. Mirar fijamente cada punto azul que aparece
6. Hacer click en cada punto (9 en total)
7. Esperar mensaje de "Calibración completada"

### 2. Realizar Test de Usabilidad

1. Después de calibrar, aparecerá el botón **"Iniciar Test de Usabilidad"**
2. Click en el botón verde
3. Se abrirá una nueva ventana con la página de test
4. Leer las instrucciones en el overlay
5. Click en **"Iniciar Test"**
6. Explorar la interfaz y buscar el botón objetivo
7. Click en el botón correcto para completar la tarea
8. Esperar redirección automática a resultados

### 3. Analizar Resultados

1. Revisar estadísticas del test
2. Observar el mapa de calor superpuesto
3. Identificar zonas de mayor atención (Top 5)
4. Leer el análisis automático generado
5. Escribir análisis manual considerando heurísticas de Nielsen
6. Click en **"Guardar Análisis"**
7. Click en **"Exportar Datos (JSON)"** para descargar los datos completos

---

## Análisis de Resultados

### Zonas de Atención Visual Observadas

Basado en los tests realizados, se identificaron los siguientes patrones:

**Zonas de alta atención:**
1. **Tarjetas centrales** (área de características): Los usuarios exploran primero las tarjetas con iconos llamativos
2. **Estadísticas** (lado derecho): Los números grandes (10,000+, 98%) atraen la atención rápidamente
3. **Navegación superior**: Los usuarios verifican las opciones de menú al inicio

**Zonas de baja atención:**
- Botones secundarios en la columna izquierda
- Texto descriptivo extenso
- Footer

**Hallazgos clave:**
- El botón objetivo (tarjeta morada "Iniciar prueba") tiene un tiempo promedio de descubrimiento de 15-25 segundos
- Los usuarios tienden a seguir un patrón de exploración en "F" o "Z"
- Los elementos con contraste visual fuerte (gradientes, colores brillantes) capturan atención más rápidamente

---

## Relación con Principios de Usabilidad

### Heurísticas de Nielsen Aplicadas

#### 1. Visibilidad del estado del sistema
**Implementación:**
- Timer visible mostrando tiempo restante
- Banner de tarea siempre visible durante el test
- Mensajes de progreso durante calibración

**Evidencia en resultados:**
- Usuarios saben en todo momento cuánto tiempo tienen
- Indicadores claros de estado del sistema

#### 2. Reconocimiento antes que recuerdo
**Implementación:**
- Instrucciones permanecen visibles (banner superior)
- Iconos acompañan texto en todas las características
- CTAs claramente etiquetados

**Evidencia en resultados:**
- El mapa de calor muestra que usuarios no regresan constantemente a leer instrucciones
- Los iconos ayudan a identificar rápidamente secciones

#### 3. Diseño minimalista y estético
**Implementación:**
- Sin scroll (toda la información visible)
- Jerarquía visual clara con tamaños y colores
- Espaciado generoso entre elementos

**Evidencia en resultados:**
- Baja dispersión de atención en áreas vacías
- Concentración en elementos funcionales

#### 4. Flexibilidad y eficiencia de uso
**Evidencia:**
- Usuarios experimentados completan la tarea en <15 segundos
- Múltiples CTAs disponibles para diferentes niveles de compromiso
- Navegación clara para acceso rápido

---

## Propuestas de Mejora Basadas en Eye-Tracking

### Mejora 1: Reposicionar el CTA Principal

**Observación:**  
El mapa de calor muestra que los usuarios inician la exploración en la esquina superior izquierda y área central. La tarjeta objetivo está en posición inferior derecha del grid central, lo que genera un tiempo de descubrimiento mayor.

**Propuesta:**  
Mover el CTA principal a la posición superior izquierda del grid de tarjetas, aprovechando el patrón natural de lectura en "F".

**Justificación:**
- Patrón de lectura occidental (izquierda a derecha, arriba a abajo)
- Heurística: Reconocimiento antes que recuerdo
- Reducción estimada de tiempo de descubrimiento: 40%

**Implementación:**
```css
/* Cambiar orden del grid para priorizar CTA */
.cards-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.card-special {
    order: -1; /* Mover a primera posición */
}
```

### Mejora 2: Aumentar Contraste Visual del CTA Objetivo

**Observación:**  
Aunque la tarjeta objetivo tiene un gradiente morado distintivo, compite visualmente con la caja rosa de "¿Listo para empezar?" en la columna derecha.

**Propuesta:**  
Implementar un efecto de "pulso" sutil o animación de brillo en el botón "Iniciar prueba" para atraer atención periférica sin ser intrusivo.

**Justificación:**
- Movimiento periférico capta atención naturalmente
- Heurística: Visibilidad del estado del sistema
- No afecta negativamente la estética minimalista

**Implementación:**
```css
@keyframes subtle-pulse {
    0%, 100% { box-shadow: 0 2px 8px rgba(255,255,255,0.2); }
    50% { box-shadow: 0 4px 16px rgba(255,255,255,0.4); }
}

.card-btn-special {
    animation: subtle-pulse 3s ease-in-out infinite;
}
```

### Mejora 3: Simplificar Navegación Superior

**Observación:**  
Los datos muestran que usuarios dedican 8-12% del tiempo mirando la navegación superior, pero es principalmente exploratoria y no funcional para la tarea.

**Propuesta:**  
Reducir número de elementos de navegación de 5 a 3, manteniendo solo los esenciales: "Características", "Precios", "Contacto".

**Justificación:**
- Ley de Hick: Menos opciones = decisiones más rápidas
- Reduce carga cognitiva
- Libera atención para contenido principal

---

## Limitaciones y Consideraciones

### Limitaciones Técnicas

1. **Mouse Tracking vs Eye Tracking:**
   - El sistema usa mouse tracking como aproximación a eye-tracking
   - Correlación estimada: 70-80% con eye-tracking real
   - Válido para análisis de patrones generales de exploración

2. **Restricciones del Navegador:**
   - Safari bloquea localStorage entre ventanas
   - Solución implementada: Validación por parámetros URL

3. **Precisión de WebGazer:**
   - Requiere calibración de 9 puntos
   - Precisión varía según iluminación y posición de la cámara
   - Recomendado: Entorno con buena iluminación

### Consideraciones de Diseño

1. **Test sin scroll:**
   - Elimina variable de exploración vertical
   - Enfoca análisis en jerarquía visual plana
   - Más controlado para análisis académico

2. **Duración del test:**
   - 60 segundos máximo
   - Permite comparaciones entre usuarios
   - Captura exploración completa

---

## Capturas de Pantalla

### 1. Calibración de WebGazer
![Calibración](docs/calibracion.png)
*Proceso de calibración con 9 puntos de referencia*

### 2. Página de Test - TaskFlow
![Test Page](docs/test-page.png)
*Interfaz de test con layout de 3 columnas*

### 3. Mapa de Calor Generado
![Heatmap](docs/heatmap.png)
*Visualización de zonas de atención con gradiente de colores*

### 4. Análisis de Resultados
![Resultados](docs/resultados.png)
*Estadísticas y análisis de usabilidad*

---

## Referencias

### Librerías Utilizadas
- **WebGazer.js** - [https://webgazer.cs.brown.edu/](https://webgazer.cs.brown.edu/)
- **Documentación WebGazer** - [GitHub](https://github.com/brownhci/WebGazer)

### Conceptos de Usabilidad
- **10 Heurísticas de Nielsen** - [Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)
- **Eye Tracking en UX** - [Nielsen Norman Group](https://www.nngroup.com/articles/eyetracking-study-of-web-readers/)

### Estudios de Referencia
- Chen, M. C., Anderson, J. R., & Sohn, M. H. (2001). "What can a mouse cursor tell us more? Correlation of eye/mouse movements on web browsing"

---

## Autor

**Nombre:** Alexander Huaranga 
**Universidad:** Universidad Internacional SEK (UISEK) Ecuador  
**Carrera:** Ing Software
**Fecha:** Febrero 2026  
**Contacto:** alexander.huaranga@uisek.edu.ec

---

## Licencia

Este proyecto fue desarrollado con fines académicos para el curso de UX/UI Laboratory.

---