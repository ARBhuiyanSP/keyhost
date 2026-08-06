const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'public', 'version.json');
const versionData = {
  version: Date.now().toString()
};

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
console.log(`Generated version.json with version: ${versionData.version}`);
