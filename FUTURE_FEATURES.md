# Future Enhancements

- **Configurable Tailwind prefix map**: make the class-group detection customizable (e.g., support project-specific prefixes or utilities) without editing `formatTailwindClasses.js`.
- **Configurable grouping map**: expose user-defined group configurations so teams can redefine which prefixes fall into which bucket.
- **Per-file behavior overrides**: support inline toggles (comments/pragma) to enable or disable multiline mode or grouping in specific sections.
- **Standalone CLI entry point**: ship a script (wrapping `formatHtmlWithTailwind`) for pipelines that need Tailwind class sorting without running Prettier.
- **Diagnostic mode**: add an option to log or surface classes that fall into the `other` bucket, helping catch typos or missing utilities.
