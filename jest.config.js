/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|js|html)$": ["ts-jest", { tsconfig: "./tsconfig.spec.json" }],
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**", "!src/processes/*", "!src/index.ts"],
};
