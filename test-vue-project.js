const { formatHtmlWithTailwind } = require('./plugin');

// Test Vue template examples
const vueExamples = [
  // Basic Vue component
  `<template>
    <div class="p-4 bg-blue-500 text-white flex justify-center items-center rounded-lg shadow-md hover:bg-blue-600 transition-colors">
      <h1 class="text-2xl font-bold">Hello Vue!</h1>
    </div>
  </template>`,

  // Vue component with multiple elements
  `<template>
    <div class="container mx-auto p-6">
      <header class="bg-gray-800 text-white p-4 rounded-t-lg">
        <h1 class="text-xl font-semibold">Vue App</h1>
      </header>
      <main class="bg-white p-6 border border-gray-200">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Click me
        </button>
      </main>
      <footer class="bg-gray-100 p-4 rounded-b-lg text-gray-600">
        <p class="text-sm">Footer content</p>
      </footer>
    </div>
  </template>`,

  // Vue component with dynamic classes (should be skipped)
  `<template>
    <div :class="{ 'bg-red-500': isError, 'bg-green-500': isSuccess }" class="p-4 rounded">
      <p class="text-white">Dynamic content</p>
    </div>
  </template>`,

  // Complex Vue component
  `<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <img class="h-8 w-8 rounded-full" src="logo.png" alt="Logo" />
              <span class="ml-2 text-xl font-semibold text-gray-900">My App</span>
            </div>
            <div class="flex items-center space-x-4">
              <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </template>`
];

console.log('🧪 Testing Tailwind Group Prettier Plugin with Vue Templates\n');

vueExamples.forEach((example, index) => {
  console.log(`\n📝 Example ${index + 1}:`);
  console.log('=' .repeat(50));
  
  console.log('\n🔴 Before formatting:');
  console.log(example);
  
  console.log('\n🟢 After formatting:');
  const formatted = formatHtmlWithTailwind(example);
  console.log(formatted);
  
  console.log('\n' + '=' .repeat(50));
});

// Test with different options
console.log('\n🎛️  Testing with different options:');
console.log('=' .repeat(50));

const testHtml = '<div class="p-4 bg-blue-500 text-white flex justify-center" />';

console.log('\n🔴 Original:');
console.log(testHtml);

console.log('\n🟢 Multiline (default):');
console.log(formatHtmlWithTailwind(testHtml));

console.log('\n🟡 Single line:');
console.log(formatHtmlWithTailwind(testHtml, { tailwindMultiline: false })); 