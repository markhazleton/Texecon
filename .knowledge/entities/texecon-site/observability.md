# Runtime Observability

The client includes lightweight, browser-local monitoring and Google Analytics
instrumentation. `AdminDashboard` exposes content validation, health status,
error monitoring, and footer-link checks through a user-opened monitoring panel.
`ErrorMonitor` stores up to the latest 50 client-side errors in component state,
including console errors, unhandled promise rejections, and JavaScript errors.

Analytics helpers send SPA page views, custom events, exceptions, and timing
events to the configured Google Analytics property when `window.gtag` exists.
The application error boundary also reports exceptions to Analytics; production
error reporting beyond Analytics is not implemented.

This monitoring is in-memory and browser-local. It is not a server-side alerting
or persistent incident-management system.

## Evidence

- `client/src/components/admin-dashboard.tsx:22-37`
- `client/src/components/error-monitor.tsx:18-78`
- `client/src/lib/analytics.ts:20-79`
- `client/src/App.tsx:40-51`
