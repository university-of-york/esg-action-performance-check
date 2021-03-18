const fs = require("fs").promises;
const artifact = require("@actions/artifact");

const uploadArtifact = async () => {
    const client = artifact.create();

    let fileNames = await fs.readdir("./reports");

    const files = fileNames.map((fileName) => './reports/'.concat(fileName));

    await client.uploadArtifact("Lighthouse reports", files, './reports/')
};

module.exports = {uploadArtifact};
