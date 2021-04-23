const core = require("@actions/core");
const {context, getOctokit} = require("@actions/github");
const {colourForScore} = require("./util");

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
                ${passFailBadge(success)}
                ${performanceBadges(scores)}
                <span>${context.sha}</span><br/>
                <a href="https://github.com/ChristianBeddows/performance-check-action">
                    <sub>performance-check-action</sub>
                </a>
            </html>`
}

const passFailBadge = (success) => {
    const text = success ? "PASSED" : "FAILED";
    const colour = success ? "brightgreen" : "red";

    return `<img src="https://img.shields.io/badge/Build-${text}-${colour}"/>`
}

const performanceBadges = (scores) => {
    const threshold = core.getInput('minimum-score') ? core.getInput('minimum-score') : 75;

    const mobileSum = scores.reduce((sum, score) => sum + score.mobile, 0);
    const desktopSum = scores.reduce((sum, score) => sum + score.desktop, 0);

    core.info(`Mobile sum of scores: ${mobileSum}`);
    core.info(`Desktop sum of scores: ${desktopSum}`);

    const averageMobileScore = Math.floor(mobileSum / scores.length);
    const averageDesktopScore = Math.floor(desktopSum / scores.length);

    const mobileColour = colourForScore(averageMobileScore, threshold);
    const desktopColour = colourForScore(averageDesktopScore, threshold);

    return `<img src="https://img.shields.io/badge/Average_Mobile_Performance-${averageMobileScore}-${mobileColour}"/>  
            <img src="https://img.shields.io/badge/Average_Desktop_Performance-${averageDesktopScore}-${desktopColour}"/>`
}

module.exports = { addOrUpdateCommentForPR };
