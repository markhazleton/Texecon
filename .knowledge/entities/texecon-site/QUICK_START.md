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

# Pre-commit checks are currently disabled; run quality commands manually.
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

The pre-commit hook is currently disabled and exits successfully without
running checks. Run the quality commands manually before committing:
1. Type checking
2. Linting
3. Formatting

Just commit normally:
```bash
git add .
git commit -m "Your commit message"
```

If a manually run check fails, fix the issue and run the check again.

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

### Pre-commit checks

The current `.husky/pre-commit` hook is disabled. Run `npm run type-check`,
`npm run lint`, and `npm run format:check` manually before committing.

## CI/CD Pipeline

On push to `main`, GitHub Actions automatically:
1. Runs security audit (non-blocking)
2. Checks generated content types formatting
3. Checks code quality (lint + format)
4. Validates types
5. Runs all tests
6. Checks test coverage (non-blocking)
7. Builds the application
8. Validates build artifacts
9. Runs Lighthouse on non-PR events
10. Uploads Pages artifacts on non-PR events; deploys `main`

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
2. **[GitHub Issues](https://github.com/MarkHazleton/Texecon/issues)** - Report problems
3. **[GitHub Actions](https://github.com/MarkHazleton/Texecon/actions)** - Build status

## Next Steps

- Read the [Developer Guide](DEVELOPER_GUIDE.md)
- Check out the [Deployment Guide](github-pages-deployment.md)
- Review the current architecture and observability notes in this entity.

## Live Site

🌐 **https://texecon.com**

---

**Happy Coding! 🚀**
