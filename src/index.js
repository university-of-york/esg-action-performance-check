const core = require("@actions/core");
const {context} = require("@actions/github");
const {lighthouseReport, checkScores} = require("./lighthouse");
const {addOrUpdateCommentForPR} = require("./comments");

(async () => {
    try {
        const urls = core.getInput('urls').split('\n');
        const iterations = core.getInput('iterations') ? core.getInput('iterations') : 5;
        const threshold = core.getInput('minimum-score') ? core.getInput('minimum-score') : 75;

        core.info(JSON.stringify(context.sha));
        core.info(JSON.stringify(context.ref));

        core.info("beginning audit");

        const scores = await lighthouseReport(urls, iterations);

        core.info("checking scores");

        const [success, output] = checkScores(scores, threshold);

        if (context.issue.number) {
            await addOrUpdateCommentForPR(scores, success, threshold);
            core.info("adding comment to PR")
        }

        core.info("Set success")

        if (success) {
            core.info("passed!");
        } else {
            core.setFailed(`The performance check failed:\n${output}`);
        }

    } catch (error) {
        core.setFailed(error.message)
    }
})();
