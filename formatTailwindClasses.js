// Predefined group map for Tailwind CSS classes
export const GROUP_MAP = {
  layout: [
    "container",
    "block",
    "inline",
    "flex",
    "grid",
    "hidden",
    "relative",
    "absolute",
    "fixed",
    "sticky",
    "static",
    "justify-",
    "items-",
    "content-",
    "self-",
    "place-",
    "order-",
    "col-",
    "row-"
  ],
  spacing: [
    "m-",
    "mx-",
    "my-",
    "mt-",
    "mr-",
    "mb-",
    "ml-",
    "p-",
    "px-",
    "py-",
    "pt-",
    "pr-",
    "pb-",
    "pl-",
    "space-",
    "gap-",
    "w-",
    "h-",
    "min-w-",
    "min-h-",
    "max-w-",
    "max-h-",
    "inset-",
    "top-",
    "bottom-",
    "left-",
    "right-"
  ],
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
 * Produce grouped & sorted Tailwind class chunks in the configured order.
 * @param {string} classString
 * @param {object} options
 * @returns {string[]} array of grouped class strings
 */
export function getTailwindClassGroups(classString, options = {}) {
  if (!classString || !classString.trim()) {
    return [];
  }

  const classes = classString.trim().split(/\s+/).filter(Boolean);
  const groupedClasses = {};

  classes.forEach(className => {
    const group = getClassGroup(className);
    if (!groupedClasses[group]) {
      groupedClasses[group] = [];
    }
    groupedClasses[group].push(className);
  });

  Object.keys(groupedClasses).forEach(group => {
    groupedClasses[group].sort((a, b) => a.localeCompare(b));
  });

  const order = resolveGroupOrder(options.tailwindGroupOrder);
  const formattedGroups = [];

  order.forEach(groupName => {
    if (groupedClasses[groupName] && groupedClasses[groupName].length > 0) {
      formattedGroups.push(groupedClasses[groupName].join(" "));
      delete groupedClasses[groupName];
    }
  });

  // Append any custom groups that weren't in the order definition
  Object.keys(groupedClasses)
    .sort()
    .forEach(groupName => {
      formattedGroups.push(groupedClasses[groupName].join(" "));
    });

  return formattedGroups;
}

/**
 * Groups and sorts Tailwind classes and returns a formatted string.
 * @param {string} classString - The original class string
 * @returns {string} - The formatted class string
 */
export function formatTailwindClasses(classString, options = {}) {
  const formattedGroups = getTailwindClassGroups(classString, options);
  if (!formattedGroups.length) {
    return classString;
  }

  if (options.multiline === false) {
    return formattedGroups.join(" ");
  }

  return `\n  ${formattedGroups.join("\n  ")}\n`;
}

/**
 * Checks if a class attribute value is a literal string (not dynamic)
 * @param {any} value - The attribute value
 * @returns {boolean} - True if it's a literal string
 */
export function isLiteralString(value) {
  return typeof value === 'string' && !value.includes('{') && !value.includes('}');
}

function resolveGroupOrder(customOrder) {
  if (!customOrder) {
    return GROUP_ORDER;
  }

  const requested = Array.isArray(customOrder)
    ? customOrder
    : String(customOrder)
        .split(',')
        .map(segment => segment.trim())
        .filter(Boolean);

  if (!requested.length) {
    return GROUP_ORDER;
  }

  const normalized = [];
  requested.forEach(groupName => {
    if (GROUP_MAP[groupName] && !normalized.includes(groupName)) {
      normalized.push(groupName);
    }
  });

  return normalized.concat(GROUP_ORDER.filter(group => !normalized.includes(group)));
}
