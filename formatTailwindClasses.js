// Predefined group map for Tailwind CSS classes
export const GROUP_MAP = {
  layout: ["container", "block", "inline", "flex", "grid", "hidden", "relative", "absolute", "fixed", "sticky", "static"],
  spacing: ["m-", "p-", "space-", "gap-", "w-", "h-", "min-w-", "min-h-", "max-w-", "max-h-"],
  typography: ["text-", "font-", "leading-", "tracking-", "align-", "whitespace-", "break-"],
  colors: ["bg-", "text-", "from-", "to-", "border-", "ring-", "fill-", "stroke-"],
  borders: ["border-", "rounded-", "shadow-", "ring-"],
  effects: ["opacity-", "shadow-", "blur-", "transition-", "duration-", "ease-", "transform-", "scale-", "rotate-", "translate-"],
  states: ["hover:", "focus:", "active:", "group-", "peer-", "disabled:", "checked:", "required:", "valid:", "invalid:"],
  other: []
};

// Group order for consistent output
export const GROUP_ORDER = ["layout", "spacing", "typography", "colors", "borders", "effects", "states", "other"];

/**
 * Determines which group a Tailwind class belongs to
 * @param {string} className - The Tailwind class name
 * @returns {string} - The group name
 */
export function getClassGroup(className) {
  // Extract base class for grouping (after last colon)
  const baseClass = className.includes(":") ? className.split(":").pop() : className;
  for (const [groupName, prefixes] of Object.entries(GROUP_MAP)) {
    if (groupName === "other") continue;
    for (const prefix of prefixes) {
      if (baseClass.startsWith(prefix)) {
        return groupName;
      }
    }
  }
  return "other";
}

/**
 * Groups and sorts Tailwind classes
 * @param {string} classString - The original class string
 * @returns {string} - The formatted class string
 */
export function formatTailwindClasses(classString, options = {}) {
  // Skip if empty or whitespace only
  if (!classString || !classString.trim()) {
    return classString;
  }

  // Split classes and filter out empty strings
  const classes = classString.trim().split(/\s+/).filter(Boolean);
  
  // Group classes by their group
  const groupedClasses = {};
  
  classes.forEach(className => {
    const group = getClassGroup(className);
    if (!groupedClasses[group]) {
      groupedClasses[group] = [];
    }
    groupedClasses[group].push(className);
  });
  
  // Sort classes within each group alphabetically
  Object.keys(groupedClasses).forEach(group => {
    groupedClasses[group].sort((a, b) => a.localeCompare(b));
  });
  
  // Build output: each group on a single line, in order
  const formattedGroups = [];
  
  GROUP_ORDER.forEach(groupName => {
    if (groupedClasses[groupName] && groupedClasses[groupName].length > 0) {
      formattedGroups.push(groupedClasses[groupName].join(" "));
    }
  });
  
  // Format as multiline string
  if (options.multiline !== false) {
    return `\n  ${formattedGroups.join("\n  ")}\n`;
  } else {
    return formattedGroups.join(" ");
  }
}

/**
 * Checks if a class attribute value is a literal string (not dynamic)
 * @param {any} value - The attribute value
 * @returns {boolean} - True if it's a literal string
 */
export function isLiteralString(value) {
  return typeof value === 'string' && !value.includes('{') && !value.includes('}');
} 