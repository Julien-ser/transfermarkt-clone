#!/usr/bin/env node

/**
 * Performance check script for Transfermarkt Clone
 * This script analyzes the bundle and provides performance recommendations
 */

import { promises as fs } from 'fs';
import path from 'path';

const BUILD_OUTPUT = path.join(process.cwd(), '.next', 'static', 'chunks');

async function analyzeBuild() {
  console.log('🔍 Performance Analysis Tool\n');
  console.log('=' .repeat(50));

  try {
    // Check if build exists
    try {
      await fs.access(BUILD_OUTPUT);
    } catch {
      console.log('❌ Build not found. Please run `npm run build` first.');
      process.exit(1);
    }

    // Analyze chunks
    const files = await fs.readdir(BUILD_OUTPUT);
    const chunks = files.filter(f => f.endsWith('.js'));

    console.log(`📦 Total JS chunks: ${chunks.length}`);

    let totalSize = 0;
    let largestChunk = { name: '', size: 0 };

    for (const chunk of chunks) {
      const stats = await fs.stat(path.join(BUILD_OUTPUT, chunk));
      totalSize += stats.size;
      if (stats.size > largestChunk.size) {
        largestChunk = { name: chunk, size: stats.size };
      }
    }

    const totalSizeKB = (totalSize / 1024).toFixed(2);
    const largestChunkKB = (largestChunk.size / 1024).toFixed(2);

    console.log(`📊 Total JS bundle size: ${totalSizeKB} KB`);
    console.log(`📈 Largest chunk: ${largestChunk.name} (${largestChunkKB} KB)`);

    // Performance recommendations
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(50));

    if (totalSize / 1024 > 500) {
      console.log('⚠️  Total bundle size is over 500KB. Consider:');
      console.log('   - More aggressive code splitting');
      console.log('   - Dynamic imports for non-critical components');
      console.log('   - Reducing dependency on large libraries');
    } else {
      console.log('✅ Total bundle size is within acceptable range (< 500KB)');
    }

    if (parseFloat(largestChunkKB) > 150) {
      console.log(`⚠️  Largest chunk is ${largestChunkKB}KB. Consider:`);
      console.log('   - Splitting this chunk further');
      console.log('   - Moving dependencies to external CDN if possible');
    } else {
      console.log('✅ No single chunk is too large (< 150KB)');
    }

    // Check for optimization configs
    console.log('\n🔧 Current Configuration:');
    console.log('-'.repeat(50));

    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    try {
      const config = await fs.readFile(nextConfigPath, 'utf-8');
      
      const hasImageOptimization = config.includes('images:') && config.includes('formats:');
      const hasCodeSplitting = config.includes('splitChunks:');
      const hasSWCMinify = config.includes('swcMinify:');
      const hasReactStrictMode = config.includes('reactStrictMode:');

      console.log(`✅ Image optimization: ${hasImageOptimization ? 'enabled' : 'disabled'}`);
      console.log(`✅ Code splitting: ${hasCodeSplitting ? 'enabled' : 'disabled'}`);
      console.log(`✅ SWC minification: ${hasSWCMinify ? 'enabled' : 'disabled'}`);
      console.log(`✅ React strict mode: ${hasReactStrictMode ? 'enabled' : 'disabled'}`);

      if (!hasImageOptimization) {
        console.log('❌ Image optimization should be configured');
      }
      if (!hasCodeSplitting) {
        console.log('❌ Code splitting should be configured');
      }
    } catch (err) {
      console.log('⚠️  Could not read next.config.js');
    }

    console.log('\n📈 To generate detailed bundle analysis:');
    console.log('   npm run analyze');
    console.log('   Then open bundle-analysis.html in your browser\n');

    console.log('🚀 To test Lighthouse score:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Open http://localhost:3000');
    console.log('   3. Run Lighthouse audit in Chrome DevTools (Performance tab)');
    console.log('   4. Or use: npx lighthouse http://localhost:3000 --view\n');

    console.log('='.repeat(50));
    console.log('✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

analyzeBuild().catch(console.error);
