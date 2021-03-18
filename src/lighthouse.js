const fs = require('fs');
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
        output: "html",
        onlyCategories: ["performance"],
        port: chrome.port,
    };

    let scores = [];
    let success = true;

    fs.mkdir('./reports', (error) => {
        if (error) {
            core.error(error);
        }
    });

    for (url of urls) {
        core.info(`Auditing ${url}`)
        let mobileReports = [];
        let desktopReports = [];

        for (let i = 0; i < iterations; i++) {
            const mobileReport = await lighthouse(url, options, mobileConfig);
            const desktopReport = await lighthouse(url, options, desktopConfig);

            fs.writeFileSync(`./reports/${sanitizedUrl(url)}-${i+1}.mobile.report.html`, mobileReport.report);
            fs.writeFileSync(`./reports/${sanitizedUrl(url)}-${i+1}.desktop.report.html`, desktopReport.report);

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

const sanitizedUrl = (url) => {
    return url.replace('http://', '')
              .replace('https://', '')
              .replace(/\//g, '_')
              .replace(/:/g, '-')
              .replace(/\./g, '-');
}

const score = (median) => {
    return Math.floor(median.categories.performance.score * 100);
}

module.exports = { lighthouseReport };
