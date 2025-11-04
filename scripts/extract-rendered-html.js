#!/usr/bin/env node

/**
 * Script para extraer HTML completamente renderizado para Google Rich Results Test
 * Uso: node scripts/extract-rendered-html.js [URL]
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function extractRenderedHTML(url) {
    console.log('🔍 Extrayendo HTML renderizado para Google Rich Results Test...');
    console.log('📍 URL:', url);
    console.log('');

    let browser;
    try {
        // Lanzar navegador headless
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();
        
        // Asegurar que JavaScript esté habilitado
        await page.setJavaScriptEnabled(true);
        
        // Configurar viewport y user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('🌐 Navegando a la página...');
        
        // Navegar a la página
        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });

        console.log('✅ Página cargada');

        // Esperar que React se cargue completamente
        console.log('⏳ Esperando que React renderice completamente...');
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Intentar esperar a que aparezca el Schema.org
        try {
            await page.waitForSelector('script[type="application/ld+json"]', { timeout: 10000 });
            console.log('✅ Schema.org detectado');
        } catch (e) {
            console.log('⚠️ Schema.org no detectado, pero continuando...');
        }

        // Extraer HTML completo
        const html = await page.content();

        // Crear nombre de archivo basado en URL
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        const videoId = params.get('video') || 'home';
        const filename = `rendered-html-${videoId}.html`;

        // Guardar HTML
        fs.writeFileSync(filename, html, 'utf8');

        console.log('💾 HTML guardado en:', filename);
        console.log('📄 Tamaño del archivo:', (html.length / 1024).toFixed(2), 'KB');

        // Mostrar stats de Schema.org
        const schemaScripts = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            return Array.from(scripts).map(script => ({
                id: script.id,
                content: script.textContent
            }));
        });

        console.log('');
        console.log('📊 Resumen del contenido extraído:');
        console.log('   📄 Scripts Schema.org encontrados:', schemaScripts.length);
        
        if (schemaScripts.length > 0) {
            schemaScripts.forEach((script, index) => {
                console.log(`   📄 Script ${index + 1}: ID "${script.id}"`);
                try {
                    const schema = JSON.parse(script.content);
                    console.log(`      - Tipo: ${schema['@type']}`);
                    console.log(`      - Nombre: ${schema.name || 'N/A'}`);
                } catch (e) {
                    console.log('      - Error parseando JSON');
                }
            });
        }

        // Verificar metadatos
        const metaData = await page.evaluate(() => {
            const metas = {};
            const metaTags = document.querySelectorAll('meta');
            metaTags.forEach(meta => {
                const name = meta.getAttribute('name') || meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (name && content) {
                    metas[name] = content;
                }
            });
            return metas;
        });

        const relevantMetas = ['description', 'og:title', 'og:description', 'og:type', 'og:image', 'twitter:card'];
        console.log('');
        console.log('🏷️ Metadatos relevantes encontrados:');
        relevantMetas.forEach(meta => {
            if (metaData[meta]) {
                console.log(`   ${meta}: ${metaData[meta].substring(0, 80)}${metaData[meta].length > 80 ? '...' : ''}`);
            }
        });

        console.log('');
        console.log('🎯 Próximos pasos:');
        console.log('1. Abre Google Rich Results Test: https://search.google.com/test/rich-results');
        console.log('2. Selecciona "Code Snippet"');
        console.log(`3. Copia el contenido del archivo: ${filename}`);
        console.log('4. Pega el HTML en la herramienta y haz clic en "Test Code"');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Obtener URL de argumentos de línea de comandos
const url = process.argv[2] || 'http://localhost:3000?video=26046339';

extractRenderedHTML(url)
    .then(() => {
        console.log('');
        console.log('🎉 Extracción completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });