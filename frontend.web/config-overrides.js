const path = require("path");

const {
  override,
  addWebpackAlias,
  removeModuleScopePlugin,
} = require("customize-cra");

module.exports = override(
  // Enable importing from outside of /src directory
  // @see https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory/44115058
  removeModuleScopePlugin(),

  // Note, these are also overridden using Storybook in .storybook/main.js
  addWebpackAlias({
    "@src": path.resolve(__dirname, "src"),
    "@assets": path.resolve(__dirname, "src/assets"),
    "@baseApps": path.resolve(__dirname, "src/baseApps"),
    "@components": path.resolve(__dirname, "src/components"),
    "@local": path.resolve(__dirname, "src/local"),
    "@shared": path.resolve(__dirname, "src/shared"),
    "@hooks": path.resolve(__dirname, "src/hooks"),
    "@providers": path.resolve(__dirname, "src/providers"),
    "@icons": path.resolve(__dirname, "src/components/icons"),
  })
);
