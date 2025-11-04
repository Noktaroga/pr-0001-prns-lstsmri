import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Simple robots.txt generator function
function generateRobotsFile(env: string, domain: string) {
  const isProduction = env === 'production';
  
  let content = `# Robots.txt for ${domain}\n`;
  content += `# Generated on: ${new Date().toISOString()}\n`;
  content += `# Environment: ${env}\n\n`;
  
  if (!isProduction) {
    content += '# Development/Staging - Block all crawlers\n';
    content += 'User-agent: *\n';
    content += 'Disallow: /\n';
  } else {
    content += '# Google Bot\n';
    content += 'User-agent: Googlebot\n';
    content += 'Allow: /\n';
    content += 'Allow: /videos/\n';
    content += 'Allow: /categories/\n';
    content += 'Disallow: /admin/\n';
    content += 'Disallow: /api/\n';
    content += 'Disallow: /user/\n';
    content += 'Crawl-delay: 1\n\n';
    
    content += '# Bing Bot\n';
    content += 'User-agent: Bingbot\n';
    content += 'Allow: /\n';
    content += 'Allow: /videos/\n';
    content += 'Allow: /categories/\n';
    content += 'Disallow: /admin/\n';
    content += 'Disallow: /api/\n';
    content += 'Disallow: /user/\n';
    content += 'Crawl-delay: 2\n\n';
    
    content += '# Block all other bots\n';
    content += 'User-agent: *\n';
    content += 'Disallow: /\n\n';
    
    content += '# Sitemaps\n';
    content += `Sitemap: ${domain}/sitemap.xml\n`;
    content += `Sitemap: ${domain}/sitemap-videos.xml\n`;
  }
  
  return content;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const domain = env.DOMAIN || 'https://yoursite.com';
    
    // Generate robots.txt during build
    const robotsContent = generateRobotsFile(mode, domain);
    const publicDir = path.resolve(__dirname, 'public');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);
    console.log(`🤖 Generated robots.txt for ${mode} environment`);
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
