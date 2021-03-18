const core = require("@actions/core");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const {computeMedianRun} = require("lighthouse/lighthouse-core/lib/median-run");
const mobileConfig = require("lighthouse/lighthouse-core/config/lr-mobile-config");
const desktopConfig = require("lighthouse/lighthouse-core/config/lr-desktop-config");

const lighthouseReport = async () => {
    const urls = core.getInput('urls').split('\n');
    const iterations = core.getInput('iterations') ? core.getInput('iterations') : 5;
    const threshold = core.getInput('minimum-score') ? core.getInput('minimum-score') : 75;

    const chrome = await chromeLauncher.launch({chromeFlags: ["--headless"]});

    const options = {
        onlyCategories: ["performance"],
        port: chrome.port,
    };

    let scores = [];
    let success = true;

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

        const mobileMedian = computeMedianRun(mobileReports);
        const desktopMedian = computeMedianRun(desktopReports);

        const mobileScore = score(mobileMedian);
        const desktopScore = score(desktopMedian);

        if (mobileScore < threshold) {
            success = false;
            core.error(`FAIL: ${url} (mobile): ${mobileScore}`);
        }
        if (desktopScore < threshold) {
            success = false;
            core.error(`FAIL: ${url} (desktop): ${desktopScore}`);
        }

        scores.push({
            url: url,
            mobile: mobileScore,
            desktop: desktopScore,
        });
    }

    await chrome.kill();

    return [scores, success]
}

const score = (median) => {
    return Math.floor(median.categories.performance.score * 100);
}

module.exports = { lighthouseReport };
