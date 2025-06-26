// Example: How to use the plugin in a Vue project

// 1. Install the plugin in your Vue project
// npm install --save-dev tailwind-group-prettier-plugin

// 2. Import the formatter
const { formatHtmlWithTailwind } = require('tailwind-group-prettier-plugin');

// 3. Use in Vue component (example)
class VueComponentFormatter {
  constructor() {
    this.formatter = formatHtmlWithTailwind;
  }

  // Format a Vue template string
  formatTemplate(template) {
    return this.formatter(template);
  }

  // Format multiple components
  formatComponents(components) {
    return components.map(component => ({
      ...component,
      template: this.formatter(component.template)
    }));
  }
}

// Example usage:
const formatter = new VueComponentFormatter();

// Test with a real Vue component template
const vueComponent = `
<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">My Vue App</h1>
          </div>
          <nav class="flex space-x-4">
            <a href="#" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Home</a>
            <a href="#" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">About</a>
            <a href="#" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
          </nav>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <p class="text-gray-500 text-lg">Your content here</p>
        </div>
      </div>
    </main>
  </div>
</template>
`;

console.log('🔴 Original Vue Component:');
console.log(vueComponent);

console.log('\n🟢 Formatted Vue Component:');
console.log(formatter.formatTemplate(vueComponent));

// 4. Integration with build tools
console.log('\n📦 Build Tool Integration Examples:');

// Webpack loader example
const webpackLoaderExample = `
// webpack.config.js
const { formatHtmlWithTailwind } = require('tailwind-group-prettier-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              preprocess: {
                template: (content) => {
                  return formatHtmlWithTailwind(content);
                }
              }
            }
          }
        ]
      }
    ]
  }
};
`;

// Vite plugin example
const vitePluginExample = `
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { formatHtmlWithTailwind } from 'tailwind-group-prettier-plugin';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Custom template processing
          preprocess: (content) => formatHtmlWithTailwind(content)
        }
      }
    })
  ]
});
`;

console.log(webpackLoaderExample);
console.log(vitePluginExample); 