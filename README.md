# Tailwind Group Prettier Plugin

A Prettier plugin that formats Tailwind CSS class attributes by grouping, sorting, and printing them in multiline format.

## Features

- ✅ Groups Tailwind classes into semantic categories (layout, spacing, typography, etc.)
- ✅ Sorts classes alphabetically within each group
- ✅ Formats output in multiline format with each group on a new line
- ✅ Supports HTML, JSX, and Vue templates
- ✅ Skips dynamic class bindings (e.g., `{dynamicClass}`, `:class="..."`)
- ✅ Maintains idempotency (multiple runs produce the same result)
- ✅ Preserves all other attributes and formatting
- ✅ Configurable options for multiline mode and custom group order

## Installation

```bash
npm install --save-dev tailwind-group-prettier-plugin
```

## Usage

### Basic Usage

The plugin will automatically format `class` and `className` attributes when you run Prettier:

```bash
npx prettier --write "**/*.{html,js,jsx,vue}"
```

If you want to exercise the plugin straight from this repository (without publishing to npm), either:

1. Use `npm link`:
   - In this repo run `npm link`.
   - In your project run `npm link prettier-tailwind-class-organizer`.
   - Add `"plugins": ["prettier-tailwind-class-organizer"]` to your Prettier config.
2. Or point Prettier at the plugin file directly when formatting:
   ```bash
   npx prettier --write "src/**/*.{html,jsx,vue}" --plugin=./path/to/plugin.js
   ```

Both approaches let you iterate locally before publishing.

### Input Example

```html
<div class="p-2 text-white flex bg-blue-500 justify-center hover:bg-blue-600" id="main" />
```

### Output Example

```html
<div
  class="
    flex justify-center
    p-2
    text-white
    bg-blue-500
    hover:bg-blue-600
  "
  id="main"
/>
```

## Configuration

### Prettier Configuration

Add the plugin to your `.prettierrc` or `prettier.config.js`:

```json
{
  "plugins": ["tailwind-group-prettier-plugin"]
}
```

### Plugin Options

You can configure the plugin behavior using these options:

```json
{
  "plugins": ["tailwind-group-prettier-plugin"],
  "tailwindMultiline": true,
  "tailwindGroupOrder": "layout,spacing,typography,colors,borders,effects,states,other"
}
```

#### Options

- `tailwindMultiline` (boolean, default: `true`): Enable/disable multiline formatting
- `tailwindGroupOrder` (string): Custom group order (comma-separated)

## Class Grouping

The plugin groups Tailwind classes into these predefined categories:

1. **Layout**: `container`, `block`, `inline`, `flex`, `grid`, `hidden`, etc.
2. **Spacing**: `m-*`, `p-*`, `space-*`, `gap-*`, `w-*`, `h-*`, etc.
3. **Typography**: `text-*`, `font-*`, `leading-*`, `tracking-*`, etc.
4. **Colors**: `bg-*`, `text-*`, `from-*`, `to-*`, `border-*`, `ring-*`, etc.
5. **Borders**: `border-*`, `rounded-*`, `shadow-*`, `ring-*`, etc.
6. **Effects**: `opacity-*`, `shadow-*`, `blur-*`, `transition-*`, etc.
7. **States**: `hover:*`, `focus:*`, `active:*`, `group-*`, `peer-*`, etc.
8. **Other**: Classes that don't match any predefined group

## Supported Formats

### HTML

```html
<!-- Input -->
<div class="p-2 text-white flex bg-blue-500 justify-center" />

<!-- Output -->
<div
  class="
    flex justify-center
    p-2
    text-white
    bg-blue-500
  "
/>
```

_Screenshot placeholder: HTML before/after_

### JSX

```jsx
// Input
<div className="p-2 text-white flex bg-blue-500 justify-center" />

// Output
<div
  className="
    flex justify-center
    p-2
    text-white
    bg-blue-500
  "
/>
```

_Screenshot placeholder: React/JSX before/after_

### Vue

```vue
<!-- Input -->
<template>
  <div class="p-2 text-white flex bg-blue-500 justify-center" />
</template>

<!-- Output -->
<template>
  <div
    class="
      flex justify-center
      p-2
      text-white
      bg-blue-500
    "
  />
</template>
```

_Screenshot placeholder: Vue before/after_

### Svelte

Install [`prettier-plugin-svelte`](https://github.com/sveltejs/prettier-plugin-svelte) alongside this plugin and include both in your Prettier configuration:

```bash
npx prettier --plugin=prettier-plugin-svelte --plugin=prettier-tailwind-class-organizer --write "**/*.svelte"
```

```svelte
<!-- Input -->
<div class="p-2 text-white flex bg-blue-500 justify-center">
  {count}
</div>

<!-- Output -->
<div
  class="
    flex justify-center
    p-2
    text-white
    bg-blue-500
  "
>
  {count}
</div>
```

_Screenshot placeholder: Svelte before/after_

## What Gets Skipped

The plugin intentionally skips dynamic class bindings to avoid breaking functionality:

```jsx
// These are NOT formatted:
<div className={dynamicClass} />
<div className={`${baseClass} ${conditionalClass}`} />
<div :class="{ active: isActive }" />
<div class="{foo && 'bar'}" />
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Examples

### Complex Example

**Input:**
```html
<div class="hover:bg-blue-500 bg-blue-300 text-white hover:text-gray-100 flex justify-center p-4 rounded-lg shadow-md transition-all duration-200" />
```

**Output:**
```html
<div
  class="
    flex justify-center
    p-4
    text-white
    bg-blue-300
    rounded-lg shadow-md
    transition-all duration-200
    hover:bg-blue-500 hover:text-gray-100
  "
/>
```

### With Custom Classes

**Input:**
```html
<div class="custom-button flex p-2 bg-blue-500 another-custom-class" />
```

**Output:**
```html
<div
  class="
    flex
    p-2
    bg-blue-500
    another-custom-class custom-button
  "
/>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT 
