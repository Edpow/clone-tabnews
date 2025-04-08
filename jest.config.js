require("dotenv").config({ path: ".env.development" });

const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
});

module.exports = jestConfig;
