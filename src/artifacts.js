const fs = require("fs");
const artifact = require("@actions/artifact");
const core = require("@actions/core")

const uploadArtifact = async () => {
    const client = artifact.create();

    const files = fs.readdir("./reports/");

    core.info(JSON.stringify(files));

    await client.uploadArtifact("Lighthouse reports", files, './reports/')
};

module.exports = {uploadArtifact};
