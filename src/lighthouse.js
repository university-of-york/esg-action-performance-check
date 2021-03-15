const core = require("@actions/core");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const {computeMedianRun} = require("lighthouse/lighthouse-core/lib/median-run");
const mobileConfig = require("lighthouse/lighthouse-core/config/lr-mobile-config");
const desktopConfig = require("lighthouse/lighthouse-core/config/lr-desktop-config");

const lighthouseReport = async (urls, iterations) => {
    const chrome = await chromeLauncher.launch({chromeFlags: ["--headless"]});

    const options = {
        // logLevel: "info",
        output: "html",
        onlyCategories: ["performance"],
        port: chrome.port,
    };

    let scores = [];

    for (url of urls) {
        core.info(`Auditing ${url}`)
        let mobileReports = [];
        let desktopReports = [];

        for (let i = 0; i < iterations; i++) {
            const mobileReport = await lighthouse(url, options, mobileConfig);
            const desktopReport = await lighthouse(url, options, desktopConfig);

            mobileReports.push(mobileReport.lhr);
            desktopReports.push(desktopReport.lhr);
        }

        let mobileMedian = computeMedianRun(mobileReports);
        let desktopMedian = computeMedianRun(desktopReports);

        scores.push({
            url: url,
            mobile: mobileMedian.categories.performance.score * 100,
            desktop: desktopMedian.categories.performance.score * 100,
        });
    }

    await chrome.kill();

    return scores
}

const checkScores = (scores, threshold) => {
    let success = true;
    let output = '';

    for (score of scores) {
        if (score.mobile < threshold) {
            success = false;
            output += `${url} (mobile): ${score.mobile}\n`
        }
        if (score.desktop < threshold) {
            success = false;
            output += `${url} (desktop): ${score.desktop}\n`
        }
    }

    return [success, output]
}

module.exports = { lighthouseReport, checkScores };
