const path = require("path");
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
  ],

  // @see https://storybook.js.org/docs/react/configure/webpack#extending-storybooks-webpack-config
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    config.resolve.alias = {
      "@src": path.resolve(__dirname, "../src"),
      "@assets": path.resolve(__dirname, "../src/assets"),
      "@components": path.resolve(__dirname, "../src/components"),
      "@shared": path.resolve(__dirname, "../src/shared"),
      "@hooks": path.resolve(__dirname, "../src/hooks"),
      "@providers": path.resolve(__dirname, "../src/providers"),
      "@icons": path.resolve(__dirname, "../src/components/icons"),
    };

    // Note: The following is utilized in config.overrides.js
    //
    // This will remove the CRA plugin that prevents to import modules from
    // outside the `src` directory, useful if you use a different directory
    // @see https://github.com/arackaf/customize-cra/blob/master/src/customizers/webpack.js
    config.resolve.plugins = config.resolve.plugins.filter(
      (p) => p.constructor.name !== "ModuleScopePlugin"
    );

    // Return the altered config
    return config;
  },
};
