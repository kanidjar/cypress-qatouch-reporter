const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: {
    "cypress-qatouch-reporter": "./src/cypress-qatouch-reporter.ts",
    "processes/push.process": "./src/processes/push.process.ts",
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "commonjs",
    },
  },
  optimization: {
    chunkIds: "named",
  },
  target: "node",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/index.js",
        },
        {
          from: "package.json",
        },
        {
          from: "./*.(md|txt)",
        },
      ],
    }),
  ],
  externalsType: "commonjs",
  externals: {
    mocha: "mocha",
    axios: "axios",
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /.node$/,
        loader: "node-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
