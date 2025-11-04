import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { generateRobotsContent } from './generate-robots.js';

interface RobotsPluginOptions {
  configPath?: string;
  outputPath?: string;
  environment?: string;
  domain?: string;
}

/**
 * Vite plugin for automatic robots.txt generation
 */
export function robotsPlugin(options: RobotsPluginOptions = {}): Plugin {
  let config: any;
  
  return {
    name: 'robots-txt-generator',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    
    buildStart() {
      console.log('🤖 Generating robots.txt...');
      
      try {
        // Load configuration
        const configPath = options.configPath || path.resolve(process.cwd(), 'robots.config.json');
        let robotsConfig;
        
        if (fs.existsSync(configPath)) {
          robotsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else {
          // Use default config
          robotsConfig = {
            domain: 'https://yoursite.com',
            environment: 'development',
            seo: {
              allowGoogleBot: true,
              allowBingBot: true,
              allowYandexBot: false,
              allowOtherBots: false,
              includeSitemap: true,
              crawlDelay: 1
            }
          };
        }
        
        // Override with plugin options
        if (options.environment) {
          robotsConfig.environment = options.environment;
        }
        if (options.domain) {
          robotsConfig.domain = options.domain;
        }
        
        // Override with environment variables
        if (process.env.NODE_ENV) {
          robotsConfig.environment = process.env.NODE_ENV;
        }
        if (process.env.DOMAIN) {
          robotsConfig.domain = process.env.DOMAIN;
        }
        
        // Generate content
        const content = generateRobotsContent(robotsConfig);
        
        // Determine output path
        const outputPath = options.outputPath || 
          path.resolve(config.root || process.cwd(), 'public', 'robots.txt');
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write file
        fs.writeFileSync(outputPath, content, 'utf8');
        
        console.log(`✅ robots.txt generated: ${outputPath}`);
        console.log(`🌐 Domain: ${robotsConfig.domain}`);
        console.log(`🔧 Environment: ${robotsConfig.environment}`);
        
      } catch (error) {
        console.error('❌ Error generating robots.txt:', error);
        throw error;
      }
    },
    
    handleHotUpdate({ file, server }) {
      // Regenerate robots.txt if config file changes
      if (file.includes('robots.config.json')) {
        console.log('🔄 Robots config changed, regenerating...');
        this.buildStart?.();
        
        // Trigger full reload
        server.ws.send({
          type: 'full-reload'
        });
      }
    }
  };
}

export default robotsPlugin;