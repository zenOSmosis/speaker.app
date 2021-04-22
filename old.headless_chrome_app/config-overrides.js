// Enable importing from outside of /src directory
// @see https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory/44115058

const { removeModuleScopePlugin } = require("customize-cra");

module.exports = removeModuleScopePlugin();
