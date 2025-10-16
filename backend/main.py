#!/usr/bin/env python3
"""
Servidor backend simplificado para probar la integración de seguridad
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import requests
import json
from typing import Dict, Any

# Configuración del servidor de seguridad
SECURITY_SERVER_URL = "http://localhost:3001"

app = FastAPI(
    title="EditApp Backend (Simplified)",
    description="Backend simplificado con integración de seguridad",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def validate_request_security(request: Request) -> bool:
    """Valida la seguridad de la petición usando el servidor de seguridad"""
    try:
        # Preparar datos para validación
        validation_data = {
            "url": str(request.url),
            "method": request.method,
            "headers": dict(request.headers),
            "user_agent": request.headers.get("user-agent", ""),
            "ip": request.client.host if request.client else "unknown"
        }
        
        # Enviar petición al servidor de seguridad
        response = requests.post(
            f"{SECURITY_SERVER_URL}/api/validate-request",
            json=validation_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("valid", False)
        else:
            print(f"Error en validación de seguridad: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error conectando al servidor de seguridad: {e}")
        return False

async def validate_file_security(file: UploadFile) -> bool:
    """Valida la seguridad del archivo usando el servidor de seguridad"""
    try:
        # Preparar datos del archivo para validación
        file_data = {
            "filename": file.filename,
            "mimetype": file.content_type,
            "size": file.size if hasattr(file, 'size') else 0
        }
        
        # Enviar petición al servidor de seguridad
        response = requests.post(
            f"{SECURITY_SERVER_URL}/api/scan-file",
            json=file_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("safe", False)
        else:
            print(f"Error en escaneo de archivo: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error conectando al servidor de seguridad: {e}")
        return False

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Middleware de seguridad que valida todas las peticiones"""
    
    # Validar seguridad de la petición
    is_valid = await validate_request_security(request)
    
    if not is_valid:
        return JSONResponse(
            status_code=403,
            content={
                "error": "Petición bloqueada por seguridad",
                "message": "La petición no pasó las validaciones de seguridad"
            }
        )
    
    # Continuar con la petición
    response = await call_next(request)
    return response

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "EditApp Backend (Simplified) - Funcionando",
        "version": "1.0.0",
        "security": "Integrado con SecurityServer-Universal"
    }

@app.get("/health")
async def health_check():
    """Verificación de salud del servidor"""
    
    # Verificar conexión con servidor de seguridad
    security_status = "disconnected"
    try:
        response = requests.get(f"{SECURITY_SERVER_URL}/health", timeout=3)
        if response.status_code == 200:
            security_status = "connected"
    except:
        pass
    
    return {
        "status": "healthy",
        "security_server": security_status,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Endpoint para subir archivos con validación de seguridad"""
    
    # Validar seguridad del archivo
    is_safe = await validate_file_security(file)
    
    if not is_safe:
        raise HTTPException(
            status_code=400,
            detail="Archivo bloqueado por seguridad"
        )
    
    # Simular procesamiento del archivo
    return {
        "message": "Archivo subido exitosamente",
        "filename": file.filename,
        "content_type": file.content_type,
        "security_validated": True
    }

@app.get("/api/test-security")
async def test_security():
    """Endpoint para probar la integración de seguridad"""
    try:
        # Probar conexión con servidor de seguridad
        response = requests.get(f"{SECURITY_SERVER_URL}/health", timeout=3)
        
        if response.status_code == 200:
            security_data = response.json()
            return {
                "security_integration": "working",
                "security_server_status": security_data,
                "message": "Integración de seguridad funcionando correctamente"
            }
        else:
            return {
                "security_integration": "error",
                "message": f"Error conectando al servidor de seguridad: {response.status_code}"
            }
            
    except Exception as e:
        return {
            "security_integration": "error",
            "message": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    print("🚀 Iniciando EditApp Backend (Simplified)")
    print("🔒 Con integración de seguridad")
    print(f"🛡️  Servidor de seguridad: {SECURITY_SERVER_URL}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )