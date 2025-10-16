// Servidor de seguridad simplificado usando solo módulos nativos de Node.js
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Configuración de seguridad básica
const BLOCKED_PATHS = ['/admin', '/.env', '/config', '/secret'];
const SUSPICIOUS_HEADERS = ['x-forwarded-for', 'x-real-ip'];
const SUSPICIOUS_USER_AGENTS = ['bot', 'crawler', 'spider'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];

// Función para validar requests
function validateRequest(req) {
    const parsedUrl = url.parse(req.url, true);
    
    // Verificar rutas bloqueadas
    for (const blockedPath of BLOCKED_PATHS) {
        if (parsedUrl.pathname.includes(blockedPath)) {
            return { valid: false, reason: `Ruta bloqueada: ${blockedPath}` };
        }
    }
    
    // Verificar headers sospechosos
    for (const header of SUSPICIOUS_HEADERS) {
        if (req.headers[header]) {
            return { valid: false, reason: `Header sospechoso: ${header}` };
        }
    }
    
    // Verificar User-Agent
    const userAgent = req.headers['user-agent'] || '';
    for (const suspicious of SUSPICIOUS_USER_AGENTS) {
        if (userAgent.toLowerCase().includes(suspicious)) {
            return { valid: false, reason: `User-Agent sospechoso: ${suspicious}` };
        }
    }
    
    return { valid: true };
}

// Función para escanear archivos
function scanFile(filename, mimetype, size) {
    // Verificar tamaño
    if (size > MAX_FILE_SIZE) {
        return { safe: false, reason: 'Archivo demasiado grande' };
    }
    
    // Verificar extensión
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(ext)) {
        return { safe: false, reason: `Tipo de archivo no permitido: ${ext}` };
    }
    
    // Verificar discrepancia entre extensión y MIME type
    const expectedMimes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
    };
    
    if (expectedMimes[ext] && mimetype !== expectedMimes[ext]) {
        return { safe: false, reason: 'Discrepancia entre extensión y tipo MIME' };
    }
    
    return { safe: true };
}

// Crear servidor HTTP
const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with, x-app-version');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Configurar respuesta JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
        // Endpoint de salud
        if (pathname === '/health') {
            const healthData = {
                status: 'healthy',
                service: 'SecurityServer-Universal',
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            };
            res.writeHead(200);
            res.end(JSON.stringify(healthData, null, 2));
            return;
        }
        
        // Endpoint de información
        if (pathname === '/') {
            const info = {
                name: 'SecurityServer-Universal',
                version: '1.0.0',
                description: 'Servidor de seguridad universal simplificado',
                endpoints: [
                    '/health - Estado del servidor',
                    '/api/validate-request - Validar requests',
                    '/api/scan-file - Escanear archivos'
                ]
            };
            res.writeHead(200);
            res.end(JSON.stringify(info, null, 2));
            return;
        }
        
        // Endpoint de validación de requests
        if (pathname === '/api/validate-request' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const requestData = JSON.parse(body);
                    const validation = validateRequest({
                        url: requestData.url || '/',
                        headers: requestData.headers || {}
                    });
                    
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        valid: validation.valid,
                        reason: validation.reason || 'Request válido',
                        timestamp: new Date().toISOString()
                    }));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }
        
        // Endpoint de escaneo de archivos
        if (pathname === '/api/scan-file' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const fileData = JSON.parse(body);
                    const scan = scanFile(
                        fileData.filename || '',
                        fileData.mimetype || '',
                        fileData.size || 0
                    );
                    
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        safe: scan.safe,
                        reason: scan.reason || 'Archivo seguro',
                        timestamp: new Date().toISOString()
                    }));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }
        
        // Endpoint no encontrado
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
        
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Error interno del servidor' }));
    }
});

// Iniciar servidor
server.listen(PORT, HOST, () => {
    console.log(`🔒 SecurityServer-Universal iniciado en http://${HOST}:${PORT}`);
    console.log(`📊 Endpoints disponibles:`);
    console.log(`   - GET  /health - Estado del servidor`);
    console.log(`   - GET  / - Información del servidor`);
    console.log(`   - POST /api/validate-request - Validar requests`);
    console.log(`   - POST /api/scan-file - Escanear archivos`);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\\n🛑 Cerrando SecurityServer-Universal...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\\n🛑 Cerrando SecurityServer-Universal...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});