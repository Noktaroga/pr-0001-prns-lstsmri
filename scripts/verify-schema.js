#!/usr/bin/env node

/**
 * Script para verificar Schema.org VideoObject usando navegador headless
 * Uso: node scripts/verify-schema.js [URL]
 */

import puppeteer from 'puppeteer';

async function verifySchemaOrg(url) {
    console.log('🔍 Verificando Schema.org VideoObject...');
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

        // Esperar más tiempo para que React termine de renderizar
        console.log('⏳ Esperando que React se cargue...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Intentar esperar a que aparezca algún elemento específico de nuestra app
        try {
            await page.waitForSelector('h1', { timeout: 10000 });
            console.log('✅ Elementos de la aplicación detectados');
        } catch (e) {
            console.log('⚠️ No se detectaron elementos específicos de la aplicación');
        }

        console.log('🔍 Buscando scripts Schema.org...');

        // Buscar todos los scripts de tipo application/ld+json
        const schemaScripts = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            return Array.from(scripts).map((script, index) => ({
                id: script.id || `schema-${index}`,
                content: script.textContent
            }));
        });

        // Debug: Verificar también si hay errores en console
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });

        // Debug: Verificar si la página tiene el componente React
        const pageInfo = await page.evaluate(() => {
            return {
                hasReact: !!window.React,
                hasReactDOM: !!window.ReactDOM,
                title: document.title,
                bodyClass: document.body.className,
                bodyContent: document.body.textContent.substring(0, 200),
                scripts: Array.from(document.querySelectorAll('script')).map(s => ({
                    src: s.src,
                    type: s.type,
                    id: s.id,
                    hasContent: !!s.textContent
                })),
                url: window.location.href,
                pathname: window.location.pathname,
                search: window.location.search,
                hasVideoDetailElement: !!document.querySelector('[class*="video-detail"], [class*="VideoDetail"]'),
                hasMainElement: !!document.querySelector('main'),
                h1Elements: Array.from(document.querySelectorAll('h1')).map(h => h.textContent)
            };
        });

        console.log('🐞 DEBUG INFO:');
        console.log('   URL actual:', pageInfo.url);
        console.log('   Título:', pageInfo.title);
        console.log('   Tiene React:', pageInfo.hasReact ? '✅' : '❌');
        console.log('   Tiene ReactDOM:', pageInfo.hasReactDOM ? '✅' : '❌');
        console.log('   Body class:', pageInfo.bodyClass);
        console.log('   Body content preview:', pageInfo.bodyContent);
        console.log('   Scripts encontrados:', pageInfo.scripts.length);
        console.log('   Tiene VideoDetail element:', pageInfo.hasVideoDetailElement ? '✅' : '❌');
        console.log('   Tiene main element:', pageInfo.hasMainElement ? '✅' : '❌');
        console.log('   H1 elements:', pageInfo.h1Elements);
        console.log('');

        if (consoleLogs.length > 0) {
            console.log('📝 Console logs:');
            consoleLogs.forEach(log => console.log('   ', log));
            console.log('');
        }

        if (schemaScripts.length === 0) {
            console.log('❌ No se encontraron scripts Schema.org');
            return;
        }

        console.log(`✅ Encontrados ${schemaScripts.length} script(s) Schema.org`);
        console.log('');

        // Analizar cada script
        schemaScripts.forEach((script, index) => {
            console.log(`📄 Script ${index + 1}:`);
            console.log(`   ID: ${script.id}`);
            
            try {
                const schema = JSON.parse(script.content);
                console.log('   Tipo:', schema['@type']);
                console.log('   Contexto:', schema['@context']);
                
                if (schema['@type'] === 'VideoObject') {
                    console.log('🎥 VIDEOOBJECT ENCONTRADO:');
                    console.log('   📝 Nombre:', schema.name);
                    console.log('   📖 Descripción:', schema.description?.substring(0, 80) + '...');
                    console.log('   🖼️ Thumbnail:', schema.thumbnailUrl ? '✅ Presente' : '❌ Ausente');
                    console.log('   ⏱️ Duración:', schema.duration);
                    console.log('   🔗 ContentURL:', schema.contentUrl);
                    console.log('   📊 Interacciones:', schema.interactionStatistic?.length || 0);
                    console.log('   ⭐ Rating:', schema.aggregateRating ? 
                        `${schema.aggregateRating.ratingValue}/5 (${schema.aggregateRating.ratingCount} votos)` : 
                        '❌ No disponible');
                    console.log('   👨‍👩‍👧‍👦 Family Friendly:', schema.isFamilyFriendly ? '✅ Sí' : '❌ No');
                    console.log('   🏷️ Género:', schema.genre);
                    console.log('');
                    console.log('📋 JSON COMPLETO:');
                    console.log('═'.repeat(50));
                    console.log(JSON.stringify(schema, null, 2));
                    console.log('═'.repeat(50));
                }
            } catch (e) {
                console.log('   ❌ Error parseando JSON:', e.message);
            }
            console.log('');
        });

        // Verificar metadatos adicionales en el head
        console.log('🔍 Verificando metadatos adicionales...');
        const metaData = await page.evaluate(() => {
            const title = document.querySelector('title')?.textContent;
            const description = document.querySelector('meta[name="description"]')?.content;
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
            const ogDescription = document.querySelector('meta[property="og:description"]')?.content;
            const ogType = document.querySelector('meta[property="og:type"]')?.content;
            
            return { title, description, ogTitle, ogDescription, ogType };
        });

        console.log('📄 Metadatos encontrados:');
        console.log('   🏷️ Title:', metaData.title || '❌ No encontrado');
        console.log('   📖 Description:', metaData.description || '❌ No encontrado');
        console.log('   🔗 OG:Title:', metaData.ogTitle || '❌ No encontrado');
        console.log('   🔗 OG:Description:', metaData.ogDescription || '❌ No encontrado');
        console.log('   🔗 OG:Type:', metaData.ogType || '❌ No encontrado');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Obtener URL de argumentos de línea de comandos - usar localhost ya que estamos ejecutando localmente
const url = process.argv[2] || 'http://localhost:4173/videos?video=82581911';

verifySchemaOrg(url)
    .then(() => {
        console.log('');
        console.log('🎉 Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });