module.exports = { 
    "extends": "airbnb-base",
    "globals": {
      "window": true,
      "document": true
    }, 
    "env": {
      "browser": true,
      "node": true
    },
    "rules": {
      "linebreak-style": ["error", "windows"],
      "import/extensions": [
        "error",
        "ignorePackages"
     ],
     "radix": ["error", "as-needed"],     
     "max-len": ["error", { "code": 120 }]
    }
  };