module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['text', 'lcov', 'clover'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/setup.js'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};