# TexEcon Quick Start Guide

Get up and running with TexEcon development in 5 minutes.

## Prerequisites

- **Node.js** 20.x or later
- **npm** (comes with Node.js)
- **Git**

## Installation

```bash
# Clone the repository
git clone https://github.com/MarkHazleton/Texecon.git
cd Texecon

# Install dependencies
npm install

# Setup Git hooks
npm run prepare
```

## Development

```bash
# Start development server
npm run dev
```

Visit http://localhost:5173

## Essential Commands

### Development
```bash
npm run dev              # Start dev server with hot reload
npm test                 # Run tests in watch mode
npm run lint             # Check code quality
npm run format           # Format code
```

### Testing
```bash
npm run test:run         # Run all tests once
npm run test:coverage    # Get coverage report
npm run test:ui          # Open interactive test UI
```

### Quality Checks
```bash
npm run type-check       # TypeScript validation
npm run lint:fix         # Auto-fix linting issues
npm run format:check     # Verify formatting
```

### Building
```bash
npm run build            # Full production build
npm run preview          # Preview production build
npm run clean            # Remove build artifacts
```

## Git Workflow

### Committing Code

Pre-commit hooks automatically run when you commit:
1. ✅ Type checking
2. ✅ Linting (with auto-fix)
3. ✅ Formatting

Just commit normally:
```bash
git add .
git commit -m "Your commit message"
```

If hooks fail, fix the issues and commit again.

**Bypass hooks** (not recommended):
```bash
git commit --no-verify
```

### Before Pushing

Verify everything works:
```bash
npm run test:run         # All tests pass
npm run build            # Build succeeds
```

## Project Structure

```
Texecon/
├── client/              # Frontend application
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── lib/       # Utilities
│   │   ├── hooks/     # Custom hooks
│   │   └── pages/     # Route components
│   └── public/         # Static assets
├── scripts/            # Build automation
├── docs/              # Documentation
└── target/            # Build output (auto-generated)
```

## Common Tasks

### Add a New Component

1. Create component file:
```typescript
// client/src/components/my-component.tsx
export function MyComponent() {
  return <div>Hello World</div>;
}
```

2. Create test file:
```typescript
// client/src/components/my-component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

3. Run tests:
```bash
npm test
```

### Add a New Route

1. Create page component in `client/src/pages/`
2. Update routing in `client/src/App.tsx`
3. Add route to sitemap generation in `scripts/generate-sitemap.js`
4. Run build to generate static page

### Update Dependencies

Dependencies are auto-updated weekly by Dependabot.

Manual update:
```bash
npm update              # Update all dependencies
npm audit fix           # Fix security vulnerabilities
```

## Troubleshooting

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tests failing
```bash
npm run test:run        # See detailed errors
```

### Linting errors
```bash
npm run lint:fix        # Auto-fix
```

### Build fails
```bash
npm run clean
npm run build
```

### Pre-commit hooks not working
```bash
npm run prepare         # Reinstall hooks
```

## CI/CD Pipeline

On push to `main`, GitHub Actions automatically:
1. ✅ Runs security audit
2. ✅ Checks code quality (lint + format)
3. ✅ Validates types
4. ✅ Runs all tests
5. ✅ Checks test coverage
6. ✅ Builds the application
7. ✅ Validates build artifacts
8. ✅ Runs Lighthouse performance tests
9. ✅ Deploys to https://texecon.com

## Performance Budgets

Lighthouse CI enforces:
- Performance: ≥ 80%
- Accessibility: ≥ 90%
- Best Practices: ≥ 90%
- SEO: ≥ 90%
- First Contentful Paint: ≤ 2s
- Largest Contentful Paint: ≤ 3s

## Getting Help

1. **[Developer Guide](DEVELOPER_GUIDE.md)** - Complete documentation
2. **[Implementation Summary](IMPROVEMENTS_IMPLEMENTED.md)** - What's new
3. **[GitHub Issues](https://github.com/MarkHazleton/Texecon/issues)** - Report problems
4. **[GitHub Actions](https://github.com/MarkHazleton/Texecon/actions)** - Build status

## Next Steps

- Read the [Developer Guide](DEVELOPER_GUIDE.md)
- Review [Implementation Summary](IMPROVEMENTS_IMPLEMENTED.md)
- Check out the [Deployment Guide](github-pages-deployment.md)
- Explore [Performance Fixes](performance-fixes.md)

## Live Site

🌐 **https://texecon.com**

---

**Happy Coding! 🚀**
