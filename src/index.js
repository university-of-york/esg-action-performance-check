const core = require("@actions/core");
const github = require("@actions/github");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const {computeMedianRun} = require("lighthouse/lighthouse-core/lib/median-run");
const mobileConfig = require("lighthouse/lighthouse-core/config/lr-mobile-config");
const desktopConfig = require("lighthouse/lighthouse-core/config/lr-desktop-config");

(async () => {
    try {
        const urls = core.getInput('urls');
        const iterations = core.getInput('iterations') ? core.getInput('iterations') : 5;
        const threshold = core.getInput('minimum-score') ? core.getInput('minimum-score') : 75;

        const chrome = await chromeLauncher.launch({chromeFlags: ["--headless"]});

        const options = {
            logLevel: "info",
            output: "html",
            onlyCategories: ["performance"],
            port: chrome.port,
        };

        let scores = [];

        for (url of urls) {
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

        let checkFailed = false;
        let failureOutput = '';

        for (score of scores) {
            if (score.mobile < threshold) {
                checkFailed = true;
                failureOutput += `${url} (mobile): ${score.mobile}\n`
            }
            if (score.desktop < threshold) {
                checkFailed = true;
                failureOutput += `${url} (desktop): ${score.desktop}\n`
            }
        }

        if (checkFailed) {
            core.setFailed(`The performance check failed:\n${failureOutput}`);
        } else {
            core.info("passed!");
        }

    } catch (error) {
        core.setFailed(error.message)
    }
})();
