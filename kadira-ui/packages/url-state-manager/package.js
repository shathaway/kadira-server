Package.describe({
  'summary': "URL State Manager for Kadira UI",
  'name': "local:url-state-manager",
  'version': '1.0.0'
});

Package.onUse(function(api) {
  api.versionsFrom("1.6.0.1");
  api.use(["underscore", "tracker"]);
  api.addFiles("lib/url-state-manager.js");
  api.export("UrlStateManager", ["client", "server"]);
});

Package.onTest(function(api) {
  api.use([
    "underscore", 
    "tracker", 
    "tinytest", 
    "localstorage", 
    "meteorhacks:flow-router@1.16.2"
  ]);
  api.use("local:url-state-manager");
  api.addFiles("test/lib/router.js");
  api.addFiles("lib/url-state-manager.js", "client");
  api.addFiles("test/url-state-manager.js", "client");
});
