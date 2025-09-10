// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.test' });
// Polyfill fetch in the test environment
try {
	// eslint-disable-next-line global-require
	require('cross-fetch/polyfill');
} catch (_) {
	// optional
}
// Enable DOM matchers for testing-library
try {
	// eslint-disable-next-line global-require
	require('@testing-library/jest-dom');
} catch (_) {
	// optional
}
