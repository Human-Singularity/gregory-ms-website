#!/usr/bin/env node
const esbuild = require('esbuild');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

// Configuration
const entryPoints = [
  // Main entry points for different pages
  'assets/js/apps/articles.jsx',
  'assets/js/apps/trials.jsx',
  'assets/js/apps/category.jsx',
  'assets/js/apps/authorProfile.jsx',
  'assets/js/apps/relevant.jsx',
];

// Create apps directory if it doesn't exist
if (!fs.existsSync('./assets/js/apps')) {
  fs.mkdirSync('./assets/js/apps', { recursive: true });
}

// Check if we're in watch mode
const isWatchMode = process.argv.includes('--watch');

// Build function
async function build() {
  try {
    console.log('🔨 Building React components with esbuild...');
    
    // Common options
    const buildOptions = {
      entryPoints,
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      target: ['es2018'],
      outdir: './static/js/',
      format: 'iife',
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
      },
      define: {
        'process.env.NODE_ENV': process.env.NODE_ENV === 'production' 
          ? '"production"' 
          : '"development"'
      },
    };
    
    if (isWatchMode) {
      // Use context for watch mode
      const context = await esbuild.context(buildOptions);
      
      await context.watch();
      console.log('👀 Watching for changes...');
      
      // Keep the process running
      process.stdin.on('close', () => {
        context.dispose();
        process.exit(0);
      });
    } else {
      // Single build
      const result = await esbuild.build(buildOptions);
      console.log('✅ Build completed successfully!');
      return result;
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
