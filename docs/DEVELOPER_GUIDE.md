# TexEcon Developer Guide

Complete guide for developers working on the TexEcon project.

## Table of Contents
- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Build Process](#build-process)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 20.x or later
- npm (comes with Node.js)
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/MarkHazleton/Texecon.git
cd Texecon

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:5173`

---

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Full production build (clean → fetch → sitemap → build → static pages) |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Check code for linting issues |
| `npm run lint:fix` | Automatically fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (for CI) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open Vitest UI for interactive testing |
| `npm run clean` | Remove build artifacts |
| `npm run fetch:content` | Fetch latest content from API |
| `npm run generate:sitemap` | Generate SEO sitemap |
| `npm run generate:static-pages` | Generate static HTML pages |

### Pre-commit Hooks

This project uses Husky to run checks before commits:

1. **Type checking** - Ensures no TypeScript errors
2. **Linting** - Checks and fixes code quality issues
3. **Formatting** - Formats code automatically

If any check fails, the commit will be blocked. Fix the issues and try again.

**To bypass hooks** (not recommended):
```bash
git commit --no-verify
```

---

## Testing

### Running Tests

```bash
# Watch mode (recommended during development)
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Writing Tests

Tests are located alongside the files they test with the `.test.tsx` or `.test.ts` extension.

**Example Component Test**:

```typescript
// client/src/components/my-component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Example Utility Test**:

```typescript
// client/src/lib/my-util.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-util';

describe('myFunction', () => {
  it('returns expected result', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Coverage Targets

| Metric | Current | Target (6 months) | Target (Production) |
|--------|---------|-------------------|---------------------|
| Lines | 20% | 60% | 80% |
| Functions | 20% | 60% | 80% |
| Branches | 20% | 60% | 80% |
| Statements | 20% | 60% | 80% |

### Test Files Location

```
client/src/
├── components/
│   ├── seo-head.tsx
│   ├── seo-head.test.tsx          ← Component tests
│   └── ...
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts              ← Utility tests
│   └── ...
└── test/
    └── setup.ts                    ← Test configuration
```

---

## Code Quality

### ESLint

ESLint catches common bugs and enforces code quality.

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Configuration**: [.eslintrc.json](../.eslintrc.json)

**Key Rules**:
- TypeScript strict checking
- React hooks rules
- Accessibility (jsx-a11y) rules
- Import organization
- Unused variable detection

### Prettier

Prettier ensures consistent code formatting.

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Configuration**: [.prettierrc](../.prettierrc)

**Settings**:
- 2 spaces indentation
- Semicolons required
- Double quotes
- 100 character line width
- Trailing commas (ES5)

### Type Safety

TypeScript strict mode is enabled.

```bash
# Check types
npm run type-check
```

**Configuration**: [tsconfig.json](../tsconfig.json)

**Strict Mode Features**:
- No implicit any
- Strict null checks
- No unused locals/parameters
- Exact optional property types

---

## Build Process

### Build Pipeline

The full build process runs in this order:

```
1. Clean       → Remove target/ directory
2. Fetch       → Get content from WebSpark API
3. Sitemap     → Generate XML sitemap + robots.txt
4. Vite Build  → Compile and optimize application
5. Static Pages → Generate pre-rendered HTML
```

### Build Scripts

Located in `scripts/`:

| Script | Purpose |
|--------|---------|
| `clean.js` | Remove build artifacts |
| `fetch-content.js` | Fetch content from CMS API |
| `generate-sitemap.js` | Create SEO sitemap |
| `generate-static-pages.js` | Pre-render dynamic routes |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE_PATH` | Base path for deployment | `/` |
| `TARGET_DIR` | Output directory | `target/` |
| `BUILD_ID` | Build identifier for caching | Git SHA or timestamp |
| `SITE_BASE_URL` | Base URL for sitemap | `https://texecon.com` |
| `CUSTOM_DOMAIN` | Custom domain for GitHub Pages | `texecon.com` |
| `CI` | CI environment flag | `false` |

### Build Output

```
target/
├── assets/              # Optimized JS/CSS bundles
├── index.html           # Main SPA entry point
├── 404.html             # GitHub Pages SPA fallback
├── sitemap.xml          # SEO sitemap
├── robots.txt           # Robot directives
├── version.json         # Build metadata
├── manifest.json        # Vite build manifest
├── bundle-stats.html    # Bundle size analysis
├── sw.js                # Service worker
├── workbox-*.js         # Workbox runtime
└── [routes]/            # Pre-rendered static pages
    └── index.html
```

### Performance Budgets

After building, check `target/bundle-stats.html` for:
- Total bundle size < 500KB
- Gzipped size < 150KB
- Individual chunks < 100KB

---

## Deployment

### GitHub Actions Pipeline

On push to `main`:

```
1. Install dependencies
2. Security audit (npm audit)
3. Lint code
4. Check formatting
5. Type check
6. Run tests
7. Check coverage
8. Build application
9. Validate artifacts
10. Lighthouse CI (parallel)
11. Deploy to GitHub Pages
```

### Deployment Checklist

Before merging to main:

- [ ] All tests pass locally (`npm run test:run`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Types check (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Coverage doesn't decrease
- [ ] Lighthouse scores are acceptable

### Manual Deployment

To deploy manually:

```bash
# Full build
npm run build

# Preview locally
npm run preview

# Push to GitHub (triggers deployment)
git push origin main
```

### Deployment Status

Check deployment status at:
- GitHub Actions: https://github.com/MarkHazleton/Texecon/actions
- Live site: https://texecon.com

---

## Troubleshooting

### Common Issues

#### "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Type errors after pulling changes

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/typescript
npm run type-check
```

#### Tests failing

```bash
# Update snapshots (if using)
npm test -- -u

# Run single test file
npm test -- path/to/test.test.tsx
```

#### Linting errors

```bash
# Auto-fix what can be fixed
npm run lint:fix

# Check specific file
npx eslint path/to/file.tsx
```

#### Build fails

```bash
# Clean and rebuild
npm run clean
npm run build

# Check for API issues
npm run fetch:content
```

#### Pre-commit hooks not running

```bash
# Reinstall Husky
npm run prepare

# Check .husky directory exists
ls -la .husky
```

### Debug Mode

Enable debug output:

```bash
# Vite debug mode
DEBUG=vite:* npm run dev

# Show full error stack traces
NODE_ENV=development npm run build
```

### Getting Help

1. Check existing [documentation](./):
   - [IMPROVEMENTS_IMPLEMENTED.md](IMPROVEMENTS_IMPLEMENTED.md)
   - [create-og-image.md](create-og-image.md)
   - [performance-fixes.md](performance-fixes.md)

2. Search [GitHub Issues](https://github.com/MarkHazleton/Texecon/issues)

3. Review [GitHub Actions logs](https://github.com/MarkHazleton/Texecon/actions)

---

## Project Structure

```
Texecon/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml           # CI/CD pipeline
│   ├── lighthouse/
│   │   └── lighthouserc.json    # Performance budgets
│   └── dependabot.yml           # Dependency updates
├── .husky/
│   └── pre-commit               # Git hooks
├── client/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── data/                # Content cache
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities
│   │   ├── pages/               # Route components
│   │   ├── test/                # Test setup
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles
│   └── index.html               # HTML template
├── docs/                        # Documentation
├── scripts/                     # Build scripts
├── .eslintrc.json               # ESLint config
├── .prettierrc                  # Prettier config
├── vitest.config.ts             # Test config
├── vite.config.ts               # Build config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies & scripts
```

---

## Best Practices

### Component Development

```typescript
// Use functional components
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
}

// Add prop types
interface Props {
  prop: string;
}

// Add tests
// MyComponent.test.tsx
describe('MyComponent', () => {
  it('renders prop', () => {
    render(<MyComponent prop="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### Accessibility

- Always add `alt` text to images
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Ensure keyboard navigation works
- Use ARIA attributes when needed
- Test with axe-core (runs automatically in dev mode)

### Performance

- Use lazy loading for images: `<LazyImage src="..." alt="..." />`
- Code split large components with `React.lazy()`
- Avoid large bundle imports
- Check bundle stats after changes

### SEO

- Update meta tags via `<SEOHead />` component
- Add structured data via `<StructuredData />` component
- Ensure all routes have static HTML (generated automatically)
- Update sitemap when adding routes

---

## Additional Resources

- [Vite Documentation](https://vite.dev/)
- [React 19 Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

---

**Last Updated**: October 22, 2025
