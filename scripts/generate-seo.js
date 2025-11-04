#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  domain: process.env.DOMAIN || 'https://yoursite.com',
  environment: process.env.NODE_ENV || 'development',
  outputDir: path.join(__dirname, '..', 'public'),
  backendDir: path.join(__dirname, '..', '..', 'backend')
};

/**
 * Generate both robots.txt and sitemap.xml files
 */
async function generateSEOFiles() {
  console.log('🚀 Generating SEO files (robots.txt + sitemap.xml)...');
  console.log(`🌐 Domain: ${config.domain}`);
  console.log(`🔧 Environment: ${config.environment}`);
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // 1. Generate robots.txt
    console.log('\n🤖 Generating robots.txt...');
    await generateRobotsTxt();
    
    // 2. Generate sitemap.xml
    console.log('\n🗺️ Generating sitemap.xml...');
    await generateSitemap();
    
    // 3. Validate generated files
    console.log('\n✅ Validating generated files...');
    validateFiles();
    
    console.log('\n🎉 SEO files generated successfully!');
    
    // 4. Show summary
    showSummary();
    
  } catch (error) {
    console.error('❌ Error generating SEO files:', error.message);
    process.exit(1);
  }
}

/**
 * Generate robots.txt using the existing script
 */
async function generateRobotsTxt() {
  try {
    const robotsScript = path.join(__dirname, 'generate-robots.js');
    const env = {
      ...process.env,
      DOMAIN: config.domain,
      NODE_ENV: config.environment
    };
    
    execSync(`node "${robotsScript}"`, { 
      cwd: __dirname,
      env,
      stdio: 'inherit'
    });
    
    console.log('✅ robots.txt generated');
  } catch (error) {
    throw new Error(`Failed to generate robots.txt: ${error.message}`);
  }
}

/**
 * Generate sitemap.xml using Python backend
 */
async function generateSitemap() {
  try {
    const pythonScript = path.join(config.backendDir, 'generate_sitemap.py');
    const configFile = path.join(config.backendDir, 'sitemap.config.json');
    
    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      throw new Error(`Python sitemap generator not found: ${pythonScript}`);
    }
    
    // Run Python sitemap generator
    const command = [
      'python',
      `"${pythonScript}"`,
      '--domain', `"${config.domain}"`,
      '--output', `"${config.outputDir}"`,
      '--config', `"${configFile}"`
    ].join(' ');
    
    execSync(command, { 
      cwd: config.backendDir,
      stdio: 'inherit'
    });
    
    console.log('✅ sitemap.xml generated');
  } catch (error) {
    console.log('⚠️ Python sitemap generation failed, trying alternative...');
    
    // Fallback: Generate basic sitemap using Node.js
    generateBasicSitemap();
  }
}

/**
 * Generate basic sitemap as fallback
 */
function generateBasicSitemap() {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Generated on ${new Date().toISOString()} -->
  <sitemap>
    <loc>${config.domain}/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${config.domain}/sitemap-videos.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${config.domain}/sitemap-categories.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  const basicMainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.domain}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${config.domain}/videos/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${config.domain}/categories/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  // Write basic sitemaps
  fs.writeFileSync(path.join(config.outputDir, 'sitemap.xml'), sitemapContent);
  fs.writeFileSync(path.join(config.outputDir, 'sitemap-main.xml'), basicMainSitemap);
  
  console.log('✅ Basic sitemap.xml generated (fallback)');
}

/**
 * Validate generated files
 */
function validateFiles() {
  const files = ['robots.txt', 'sitemap.xml'];
  const results = {};
  
  files.forEach(file => {
    const filePath = path.join(config.outputDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      results[file] = {
        exists: true,
        size: stats.size,
        modified: stats.mtime
      };
      console.log(`✅ ${file}: ${stats.size} bytes`);
    } else {
      results[file] = { exists: false };
      console.log(`❌ ${file}: Not found`);
    }
  });
  
  return results;
}

/**
 * Show summary of generated files
 */
function showSummary() {
  console.log('\n📊 Generated Files Summary:');
  console.log('═'.repeat(50));
  
  const publicDir = config.outputDir;
  const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.txt') || f.endsWith('.xml'));
  
  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📄 ${file.padEnd(25)} ${sizeKB.padStart(8)} KB`);
  });
  
  console.log('═'.repeat(50));
  console.log(`🌐 Domain: ${config.domain}`);
  console.log(`📁 Output: ${publicDir}`);
  console.log(`🔧 Environment: ${config.environment}`);
  
  // URLs for testing
  console.log('\n🔗 Test URLs:');
  console.log(`   ${config.domain}/robots.txt`);
  console.log(`   ${config.domain}/sitemap.xml`);
  console.log(`   ${config.domain}/sitemap-videos.xml`);
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  args.forEach((arg, index) => {
    if (arg === '--domain' && args[index + 1]) {
      config.domain = args[index + 1];
    }
    if (arg === '--env' && args[index + 1]) {
      config.environment = args[index + 1];
    }
    if (arg === '--help') {
      console.log(`
SEO Files Generator
==================

Usage: node generate-seo.js [options]

Options:
  --domain <url>     Override domain (default: https://yoursite.com)
  --env <env>        Override environment (default: development)
  --help            Show this help

Examples:
  node generate-seo.js --domain https://mysite.com --env production
  DOMAIN=https://mysite.com NODE_ENV=production node generate-seo.js
      `);
      process.exit(0);
    }
  });
  
  generateSEOFiles();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSEOFiles, generateRobotsTxt, generateSitemap };