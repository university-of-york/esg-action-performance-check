const core = require("@actions/core");
const {context, getOctokit} = require("@actions/github");

const addOrUpdateCommentForPR = async (scores, success, threshold) => {
    const token = core.getInput('repo-token');

    const {repo, owner, number: issue_number} = context.issue;

    core.info("Get octokit");

    const octokit = getOctokit(token);

    const comments = await octokit.issues.listComments({
        owner,
        repo,
        issue_number,
    });

    core.info(JSON.stringify(comments));

    const comment_id = findComment(comments);

    if (comment_id) {
        core.info(`Update comment: owner=${owner}, repo=${repo}, issue=${issue_number}, comment=${comment_id}`);

        await octokit.issues.updateComment({
            owner,
            repo,
            issue_number,
            comment_id,
            body: generateComment(scores, success, threshold)
        });
    } else {
        core.info(`Create comment: owner=${owner}, repo=${repo}, issue=${issue_number}`);

        await octokit.issues.createComment({
            owner,
            repo,
            issue_number,
            body: generateComment(scores, success, threshold)
        });
    }
}

const findComment = (comments) => {
    const comment = comments.data.find(comment => {
        core.info(JSON.stringify(comment));
        return comment.user.login === "github-actions[bot]"
        &&
        comment.body.includes("<sub>performance-check-action</sub>");
    });
    core.info(JSON.stringify(comment))
    return comment.id;
};

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
                                                    <td>${score.mobile}</td>
                                                    <td>${score.desktop}</td>
                                               </tr>`
                            }, '')
                        }
                    </tbody>
                </table>
                <p>Result: ${success ? "PASS" : "FAIL"}</p>
                <span>${commit}</span><br/>
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

module.exports = { addOrUpdateCommentForPR };
