#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extraer la estructura y contenido del proyecto WebGazer Lab
Genera un archivo de texto con toda la documentación del código fuente
"""

import os
from datetime import datetime
from pathlib import Path

# Configuración
PROJECT_ROOT = "."  # Directorio actual (donde está el proyecto)
OUTPUT_FILE = "project_documentation.txt"

# Archivos a incluir (extensiones)
INCLUDE_EXTENSIONS = {'.html', '.css', '.js', '.md', '.json', '.py'}

# Directorios a excluir
EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '__pycache__',
    'dist',
    'build',
    '.vscode',
    '.idea'
}

# Archivos a excluir (librerías)
EXCLUDE_FILES = {
    'webgazer.js',  # Librería externa
    'heatmap.js',
    'heatmap.min.js'
}

# Archivos en mediapipe (solo listar, no incluir contenido)
MEDIAPIPE_DIR = 'mediapipe'

def should_exclude_dir(dir_path):
    """Verifica si un directorio debe ser excluido"""
    dir_name = os.path.basename(dir_path)
    return dir_name in EXCLUDE_DIRS or dir_name.startswith('.')

def should_include_file(file_path):
    """Verifica si un archivo debe ser incluido"""
    file_name = os.path.basename(file_path)
    file_ext = os.path.splitext(file_name)[1]
    
    # Excluir archivos específicos
    if file_name in EXCLUDE_FILES:
        return False
    
    # Incluir solo extensiones permitidas
    return file_ext in INCLUDE_EXTENSIONS

def is_in_mediapipe(file_path):
    """Verifica si el archivo está en la carpeta mediapipe"""
    return MEDIAPIPE_DIR in Path(file_path).parts

def get_relative_path(file_path, root):
    """Obtiene la ruta relativa desde la raíz del proyecto"""
    try:
        return os.path.relpath(file_path, root)
    except ValueError:
        return file_path

def get_file_tree(root_dir):
    """Genera el árbol de directorios del proyecto"""
    tree_lines = []
    tree_lines.append("=" * 80)
    tree_lines.append("ESTRUCTURA DEL PROYECTO")
    tree_lines.append("=" * 80)
    tree_lines.append("")
    
    for root, dirs, files in os.walk(root_dir):
        # Filtrar directorios excluidos
        dirs[:] = [d for d in dirs if not should_exclude_dir(os.path.join(root, d))]
        
        level = root.replace(root_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        rel_path = get_relative_path(root, root_dir)
        
        if rel_path == '.':
            tree_lines.append(f"{indent}webgazer-lab/")
        else:
            tree_lines.append(f"{indent}{os.path.basename(root)}/")
        
        # Archivos
        sub_indent = ' ' * 2 * (level + 1)
        for file in sorted(files):
            file_path = os.path.join(root, file)
            
            # Marcar si es librería o si será incluido
            if file in EXCLUDE_FILES:
                tree_lines.append(f"{sub_indent}{file} [LIBRERÍA EXTERNA]")
            elif is_in_mediapipe(file_path):
                tree_lines.append(f"{sub_indent}{file} [MEDIAPIPE]")
            elif should_include_file(file_path):
                tree_lines.append(f"{sub_indent}{file}")
    
    tree_lines.append("")
    return "\n".join(tree_lines)

def extract_file_content(file_path, root_dir):
    """Extrae el contenido de un archivo"""
    lines = []
    rel_path = get_relative_path(file_path, root_dir)
    
    lines.append("=" * 80)
    lines.append(f"ARCHIVO: {rel_path}")
    lines.append("=" * 80)
    lines.append("")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines.append(content)
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()
                lines.append(content)
        except Exception as e:
            lines.append(f"[ERROR AL LEER ARCHIVO: {e}]")
    except Exception as e:
        lines.append(f"[ERROR AL LEER ARCHIVO: {e}]")
    
    lines.append("")
    lines.append("")
    
    return "\n".join(lines)

def generate_documentation(root_dir, output_file):
    """Genera el archivo de documentación completo"""
    
    print(f"Generando documentación del proyecto...")
    print(f"Directorio raíz: {os.path.abspath(root_dir)}")
    print(f"Archivo de salida: {output_file}")
    print("")
    
    with open(output_file, 'w', encoding='utf-8') as out:
        # Encabezado
        out.write("=" * 80 + "\n")
        out.write("DOCUMENTACIÓN DEL PROYECTO: WEBGAZER LAB\n")
        out.write("Práctica de Eye Tracking - UX/UI Laboratory\n")
        out.write("Universidad Internacional SEK (UISEK) Ecuador\n")
        out.write("=" * 80 + "\n")
        out.write(f"\nFecha de generación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write("\n\n")
        
        # Árbol de directorios
        tree = get_file_tree(root_dir)
        out.write(tree)
        out.write("\n\n")
        
        # Separador
        out.write("=" * 80 + "\n")
        out.write("CONTENIDO DE ARCHIVOS\n")
        out.write("=" * 80 + "\n")
        out.write("\n\n")
        
        # Recopilar archivos
        files_to_process = []
        mediapipe_files = []
        
        for root, dirs, files in os.walk(root_dir):
            # Filtrar directorios excluidos
            dirs[:] = [d for d in dirs if not should_exclude_dir(os.path.join(root, d))]
            
            for file in sorted(files):
                file_path = os.path.join(root, file)
                
                if is_in_mediapipe(file_path):
                    mediapipe_files.append(get_relative_path(file_path, root_dir))
                elif should_include_file(file_path):
                    files_to_process.append(file_path)
        
        # Procesar archivos por categoría
        categories = {
            'HTML': [f for f in files_to_process if f.endswith('.html')],
            'CSS': [f for f in files_to_process if f.endswith('.css')],
            'JavaScript': [f for f in files_to_process if f.endswith('.js')],
            'Markdown': [f for f in files_to_process if f.endswith('.md')],
            'Configuración': [f for f in files_to_process if f.endswith(('.json', '.py'))]
        }
        
        for category, files in categories.items():
            if files:
                out.write("\n")
                out.write("#" * 80 + "\n")
                out.write(f"# {category.upper()}\n")
                out.write("#" * 80 + "\n")
                out.write("\n\n")
                
                for file_path in files:
                    print(f"Procesando: {get_relative_path(file_path, root_dir)}")
                    content = extract_file_content(file_path, root_dir)
                    out.write(content)
        
        # Listar archivos de mediapipe
        if mediapipe_files:
            out.write("\n")
            out.write("=" * 80 + "\n")
            out.write("ARCHIVOS DE MEDIAPIPE (no incluidos en detalle)\n")
            out.write("=" * 80 + "\n")
            out.write("\n")
            for file in mediapipe_files:
                out.write(f"  - {file}\n")
            out.write("\n")
        
        # Resumen
        out.write("\n")
        out.write("=" * 80 + "\n")
        out.write("RESUMEN\n")
        out.write("=" * 80 + "\n")
        out.write(f"\nTotal de archivos documentados: {len(files_to_process)}\n")
        out.write(f"Archivos MediaPipe (listados): {len(mediapipe_files)}\n")
        
        for category, files in categories.items():
            if files:
                out.write(f"{category}: {len(files)} archivo(s)\n")
    
    print("")
    print(f"Documentación generada exitosamente: {output_file}")
    print(f"Total de archivos procesados: {len(files_to_process)}")

if __name__ == "__main__":
    generate_documentation(PROJECT_ROOT, OUTPUT_FILE)