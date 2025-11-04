#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for robots.txt generation
const robotsConfig = {
  // Environment variables with fallbacks
  domain: process.env.DOMAIN || 'https://yoursite.com',
  environment: process.env.NODE_ENV || 'development',
  
  // SEO Configuration
  seo: {
    allowGoogleBot: true,
    allowBingBot: true,
    allowYandexBot: false, // Consider privacy for adult content
    allowOtherBots: false,
    includeSitemap: true,
    crawlDelay: 1
  },
  
  // Path configurations
  paths: {
    // Allowed paths
    allow: [
      '/',
      '/videos/',
      '/categories/',
      '/search/'
    ],
    
    // Blocked paths
    disallow: [
      '/admin/',
      '/api/',
      '/private/',
      '/user/',
      '/payment/',
      '/temp/',
      '/cache/',
      '*.json',
      '*.xml',
      '/backend/'
    ]
  },
  
  // Custom rules for specific bots
  customRules: [
    {
      userAgent: 'Googlebot',
      allow: ['/videos/', '/categories/'],
      disallow: ['/user/', '/private/'],
      crawlDelay: 1
    },
    {
      userAgent: 'Bingbot',
      allow: ['/videos/', '/categories/'],
      disallow: ['/user/', '/private/', '/admin/'],
      crawlDelay: 2
    }
  ]
};

/**
 * Generates robots.txt content based on configuration
 */
function generateRobotsContent(config) {
  let content = '';
  
  // Add header comment
  content += `# Robots.txt for ${config.domain}\n`;
  content += `# Generated on: ${new Date().toISOString()}\n`;
  content += `# Environment: ${config.environment}\n\n`;
  
  // Handle different environments
  if (config.environment === 'development' || config.environment === 'staging') {
    content += '# Development/Staging - Block all crawlers\n';
    content += 'User-agent: *\n';
    content += 'Disallow: /\n\n';
    return content;
  }
  
  // Production rules
  if (config.seo.allowGoogleBot) {
    content += '# Google Bot\n';
    content += 'User-agent: Googlebot\n';
    
    // Add custom rules for Googlebot if available
    const googleRules = config.customRules.find(rule => rule.userAgent === 'Googlebot');
    if (googleRules) {
      googleRules.allow.forEach(path => {
        content += `Allow: ${path}\n`;
      });
      googleRules.disallow.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
      if (googleRules.crawlDelay) {
        content += `Crawl-delay: ${googleRules.crawlDelay}\n`;
      }
    } else {
      config.paths.allow.forEach(path => {
        content += `Allow: ${path}\n`;
      });
      config.paths.disallow.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
    }
    content += '\n';
  }
  
  if (config.seo.allowBingBot) {
    content += '# Bing Bot\n';
    content += 'User-agent: Bingbot\n';
    
    const bingRules = config.customRules.find(rule => rule.userAgent === 'Bingbot');
    if (bingRules) {
      bingRules.allow.forEach(path => {
        content += `Allow: ${path}\n`;
      });
      bingRules.disallow.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
      if (bingRules.crawlDelay) {
        content += `Crawl-delay: ${bingRules.crawlDelay}\n`;
      }
    } else {
      config.paths.allow.forEach(path => {
        content += `Allow: ${path}\n`;
      });
      config.paths.disallow.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
    }
    content += '\n';
  }
  
  // Block other bots if not allowed
  if (!config.seo.allowOtherBots) {
    content += '# Block all other bots\n';
    content += 'User-agent: *\n';
    content += 'Disallow: /\n\n';
  }
  
  // Add sitemap if enabled
  if (config.seo.includeSitemap) {
    content += `# Sitemap\n`;
    content += `Sitemap: ${config.domain}/sitemap.xml\n`;
    content += `Sitemap: ${config.domain}/sitemap-videos.xml\n`;
  }
  
  return content;
}

/**
 * Main function to generate and save robots.txt
 */
function main() {
  try {
    console.log('🤖 Generating robots.txt...');
    
    // Generate content
    const robotsContent = generateRobotsContent(robotsConfig);
    
    // Determine output path
    const outputDir = path.join(__dirname, '../public');
    const outputPath = path.join(outputDir, 'robots.txt');
    
    // Ensure public directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write robots.txt file
    fs.writeFileSync(outputPath, robotsContent, 'utf8');
    
    console.log('✅ robots.txt generated successfully!');
    console.log(`📁 Location: ${outputPath}`);
    console.log(`🌐 Domain: ${robotsConfig.domain}`);
    console.log(`🔧 Environment: ${robotsConfig.environment}`);
    
    // Log preview of content
    console.log('\n📄 Content Preview:');
    console.log('─'.repeat(50));
    console.log(robotsContent.split('\n').slice(0, 10).join('\n'));
    if (robotsContent.split('\n').length > 10) {
      console.log('...');
    }
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('❌ Error generating robots.txt:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateRobotsContent, robotsConfig };