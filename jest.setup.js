/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.test' });

// Polyfill fetch in the test environment (optional)
try {
	require('cross-fetch/polyfill');
} catch {}

// Enable DOM matchers for testing-library (optional)
try {
	require('@testing-library/jest-dom');
} catch {}
