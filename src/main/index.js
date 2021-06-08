const core = require("@actions/core");
const { context } = require("@actions/github");
const { lighthouseReport } = require("./lighthouse");
const { addOrUpdateCommentForPR } = require("./comments");

(async () => {
    try {
        const [scores, success] = await lighthouseReport();

        if (context.issue.number) {
            await addOrUpdateCommentForPR(scores, success);
        }

        if (success) {
            core.info("The performance check passed.");
        } else {
            core.setFailed("The performance check failed.");
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
