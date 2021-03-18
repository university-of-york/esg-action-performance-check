const fs = require("fs").promises;
const artifact = require("@actions/artifact");
const core = require("@actions/core")

const uploadArtifact = async () => {
    const client = artifact.create();

    let fileNames = await fs.readdir("./reports");

    core.info(JSON.stringify(fileNames));

    const files = fileNames.map((fileName) => './reports/'.concat(fileName));

    core.info(JSON.stringify(files));

    await client.uploadArtifact("Lighthouse reports", files, './reports/')
};

module.exports = {uploadArtifact};
