const core = require("@actions/core");
const {context, getOctokit} = require("@actions/github");

const addOrUpdateCommentForPR = async (scores, success) => {
    const token = core.getInput('repo-token');
    const {repo, owner, number: issue_number} = context.issue;

    const octokit = getOctokit(token);

    const comments = await octokit.issues.listComments({
        owner,
        repo,
        issue_number,
    });

    const comment_id = findComment(comments);

    if (comment_id) {
        await octokit.issues.updateComment({
            owner,
            repo,
            issue_number,
            comment_id,
            body: generateComment(scores, success)
        });
    } else {
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number,
            body: generateComment(scores, success)
        });
    }
}

const findComment = (comments) => {
    const comment = comments.data.find(comment => {
        return comment.user.login === "github-actions[bot]"
            &&
            comment.body.includes("<sub>performance-check-action</sub>");
    });
    return (comment) ? comment.id : null;
};

const generateComment = (scores, success) => {
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
                <span>${context.sha}</span><br/>
                <a href="https://github.com/ChristianBeddows/performance-check-action">
                    <sub>performance-check-action</sub>
                </a>
            </html>`
}

module.exports = { addOrUpdateCommentForPR };
