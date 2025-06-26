// VS Code Integration Example
// This shows how to use the plugin with VS Code extensions

const { formatHtmlWithTailwind } = require('./plugin');

// Example: VS Code extension that formats Vue templates
class VSCodeVueFormatter {
  constructor() {
    this.supportedLanguages = ['vue', 'html'];
  }

  // Format document content
  formatDocument(content, language) {
    if (this.supportedLanguages.includes(language)) {
      return formatHtmlWithTailwind(content);
    }
    return content;
  }

  // Format selection
  formatSelection(content, language) {
    if (this.supportedLanguages.includes(language)) {
      return formatHtmlWithTailwind(content);
    }
    return content;
  }

  // Get formatting options
  getFormattingOptions() {
    return {
      multiline: true,
      groupOrder: 'layout,spacing,typography,colors,borders,effects,states,other'
    };
  }
}

// Example: package.json for VS Code extension
const vscodeExtensionManifest = {
  "name": "vue-tailwind-formatter",
  "displayName": "Vue Tailwind Formatter",
  "description": "Format Tailwind CSS classes in Vue templates",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.60.0"
  },
  "categories": ["Formatters"],
  "activationEvents": [
    "onLanguage:vue",
    "onLanguage:html"
  ],
  "main": "./extension.js",
  "contributes": {
    "commands": [
      {
        "command": "vueTailwindFormatter.format",
        "title": "Format Tailwind Classes"
      }
    ],
    "keybindings": [
      {
        "command": "vueTailwindFormatter.format",
        "key": "ctrl+shift+f",
        "when": "editorLangId == vue"
      }
    ]
  }
};

// Example: VS Code extension main file
const vscodeExtensionCode = `
const vscode = require('vscode');
const { formatHtmlWithTailwind } = require('tailwind-group-prettier-plugin');

function activate(context) {
  // Register format command
  let disposable = vscode.commands.registerCommand('vueTailwindFormatter.format', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const language = document.languageId;

    if (language === 'vue' || language === 'html') {
      const text = document.getText();
      const formatted = formatHtmlWithTailwind(text);
      
      editor.edit(editBuilder => {
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );
        editBuilder.replace(fullRange, formatted);
      });
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
`;

console.log('🔧 VS Code Integration Example');
console.log('=' .repeat(50));

console.log('\n📦 Extension Manifest (package.json):');
console.log(JSON.stringify(vscodeExtensionManifest, null, 2));

console.log('\n💻 Extension Code (extension.js):');
console.log(vscodeExtensionCode);

console.log('\n🎯 Usage in VS Code:');
console.log(`
1. Install the extension
2. Open a .vue file
3. Press Ctrl+Shift+F (or Cmd+Shift+F on Mac)
4. Tailwind classes will be automatically formatted
`);

// Test the formatter
const testVueContent = `
<template>
  <div class="p-4 bg-blue-500 text-white flex justify-center items-center rounded-lg shadow-md hover:bg-blue-600 transition-colors">
    <h1 class="text-2xl font-bold">Hello VS Code!</h1>
  </div>
</template>
`;

console.log('\n🧪 Test Formatter:');
console.log('🔴 Original:');
console.log(testVueContent);

console.log('\n🟢 Formatted:');
console.log(formatHtmlWithTailwind(testVueContent)); 