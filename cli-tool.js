#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { formatHtmlWithTailwind } = require('./plugin');

// CLI tool for processing Vue files
class VueTailwindFormatter {
  constructor() {
    this.processedFiles = 0;
    this.errors = [];
  }

  // Process a single file
  processFile(filePath, options = {}) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const formatted = formatHtmlWithTailwind(content, options);
      
      if (options.dryRun) {
        console.log(`📄 ${filePath}`);
        console.log('🔴 Original:');
        console.log(content);
        console.log('\n🟢 Formatted:');
        console.log(formatted);
        console.log('=' .repeat(50));
      } else {
        fs.writeFileSync(filePath, formatted);
        console.log(`✅ Formatted: ${filePath}`);
      }
      
      this.processedFiles++;
      return true;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  // Process all Vue files in a directory
  processDirectory(dirPath, options = {}) {
    const files = this.findVueFiles(dirPath);
    
    console.log(`🔍 Found ${files.length} Vue files in ${dirPath}`);
    
    files.forEach(file => {
      this.processFile(file, options);
    });
    
    this.printSummary();
  }

  // Find all .vue files recursively
  findVueFiles(dirPath) {
    const files = [];
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          files.push(...this.findVueFiles(fullPath));
        }
      } else if (item.endsWith('.vue')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  printSummary() {
    console.log('\n📊 Summary:');
    console.log(`✅ Processed: ${this.processedFiles} files`);
    console.log(`❌ Errors: ${this.errors.length} files`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    multiline: true,
    directory: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--single-line':
        options.multiline = false;
        break;
      case '--dir':
        options.directory = args[++i];
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
🧪 Vue Tailwind Formatter CLI

Usage: node cli-tool.js [options]

Options:
  --dry-run     Show what would be formatted without making changes
  --single-line Format classes in single line instead of multiline
  --dir <path>  Directory to process (default: current directory)
  --help        Show this help message

Examples:
  node cli-tool.js --dry-run                    # Preview changes
  node cli-tool.js --dir ./src/components       # Format specific directory
  node cli-tool.js --single-line --dir ./src    # Single line format
`);
}

// Main execution
function main() {
  const options = parseArgs();
  const formatter = new VueTailwindFormatter();
  
  const targetDir = options.directory || process.cwd();
  
  console.log('🧪 Vue Tailwind Formatter CLI');
  console.log('=' .repeat(40));
  console.log(`📁 Target: ${targetDir}`);
  console.log(`🎛️  Options:`, options);
  console.log('=' .repeat(40));
  
  formatter.processDirectory(targetDir, options);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = VueTailwindFormatter; 