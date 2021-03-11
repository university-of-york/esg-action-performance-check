const core = require("@actions/core");
const github = require("@actions/github");

const addCommentToPR = async (scores, success) => {
    const token = core.getInput('repo-token');

    const {
        payload: {pull_request: pullRequest, issue, repository},
        sha: commitSha,
    } = github.context;

    const [owner, repo] = repository.full_name.split('/');

    const octokit = github.getOctokit(token);

    await octokit.issues.createComment({
        owner: owner,
        repo: repo,
        issue_number: issue,
        body: generateComment(scores, success)
    });
}

const generateComment = (scores, success) => {
    return `
        <html>
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
            <p>Result: ${success ? "Pass" : "Fail"}</p>
            <sub>performance-check-action</sub>
        </html>
    `
}

module.exports = { addCommentToPR };
