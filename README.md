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