const core = require("@actions/core");
const {context, getOctokit} = require("@actions/github");

const addCommentToPR = async (scores, success, threshold) => {
    const token = core.getInput('repo-token');

    const {repo, owner, number: issue_number} = context.issue;

    core.info("Get octokit");

    const octokit = getOctokit(token);

    core.info(`Create comment: owner=${owner}, repo=${repo}, issue=${issue_number}`);

    await octokit.issues.createComment({
        owner,
        repo,
        issue_number,
        body: generateComment(scores, success, threshold)
    });
}

const generateComment = (scores, success, threshold) => {
    const commit = context.sha;
    return `<html>
                <h1>Performance scores</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Mobile Score</th>
                            <th>Desktop Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            scores.reduce((body, score) => {
                                return body + `<tr>
                                                    <td>${score.url}</td>
                                                    <td style="color:${colour(score.mobile, threshold)}">${score.mobile}</td>
                                                    <td style="color:${colour(score.desktop, threshold)}">${score.desktop}</td>
                                               </tr>`
                            }, '')
                        }
                    </tbody>
                </table>
                <p>Result: ${success ? "PASS" : "FAIL"}</p>
                <sub>${commit}</sub><br/>
                <sub>performance-check-action</sub>
            </html>`
}

const colour = (scoreFloat, threshold) => {
    const score = Math.floor(scoreFloat)

    if (score > threshold) {
        return "green"
    } else if (score === threshold) {
        return "orange"
    } else {
        return "red"
    }
}

module.exports = { addCommentToPR };
