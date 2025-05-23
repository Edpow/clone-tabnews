require("dotenv").config({ path: ".env.development" });

const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});

module.exports = jestConfig;
