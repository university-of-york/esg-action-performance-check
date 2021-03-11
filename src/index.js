const core = require("@actions/core");
const {lighthouseReport, checkScores} = require("./lighthouse");
const {addCommentToPR} = require("./comments");

(async () => {
    try {
        const urls = core.getInput('urls').split('\n');
        const iterations = core.getInput('iterations') ? core.getInput('iterations') : 5;
        const threshold = core.getInput('minimum-score') ? core.getInput('minimum-score') : 75;

        const scores = await lighthouseReport(urls, iterations);

        const [success, output] = checkScores(scores, threshold);

        await addCommentToPR(scores, success);

        if (success) {
            core.info("passed!");
        } else {
            core.setFailed(`The performance check failed:\n${output}`);
        }

    } catch (error) {
        core.setFailed(error.message)
    }
})();
