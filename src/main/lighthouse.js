const fs = require("fs");
const core = require("@actions/core");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const { computeMedianRun } = require("lighthouse/lighthouse-core/lib/median-run");
const mobileConfig = require("lighthouse/lighthouse-core/config/lr-mobile-config");
const desktopConfig = require("lighthouse/lighthouse-core/config/lr-desktop-config");
const config = require("./config");

const scores = [];
let isSuccess = true;
let reportIteration = 1;
let chromePort;

const lighthouseReport = async () => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
    chromePort = chrome.port;

    setupDirs();

    for (const url of config.urls()) {
        const score = await auditUrl(url);

        scores.push(score);
    }

    fs.writeFileSync("./results/result.json", JSON.stringify({ isSuccess, scores }));

    await chrome.kill();

    return [scores, isSuccess];
};

const setupDirs = () => {
    fs.mkdir("./reports", (error) => {
        if (error) {
            core.error(error);
        }
    });

    fs.mkdir("./results", (error) => {
        if (error) {
            core.error(error);
        }
    });
};

const auditUrl = async (url) => {
    core.info(`Auditing ${url}`);
    const mobileReports = [];
    const desktopReports = [];

    for (let i = 0; i < config.iterations(); i++) {
        const mobileReport = await lighthouse(url, config.options(chromePort), mobileConfig);
        const desktopReport = await lighthouse(url, config.options(chromePort), desktopConfig);

        fs.writeFileSync(`./reports/${reportIteration}.mobile.report.html`, mobileReport.report);
        fs.writeFileSync(`./reports/${reportIteration}.desktop.report.html`, desktopReport.report);

        mobileReports.push(mobileReport.lhr);
        desktopReports.push(desktopReport.lhr);

        reportIteration++;
    }

    const mobileScore = score(mobileReports);
    const desktopScore = score(desktopReports);

    if (mobileScore < config.mobileThreshold()) {
        isSuccess = false;
        core.error(`FAIL: ${url} (mobile): ${mobileScore}`);
    }

    if (desktopScore < config.desktopThreshold()) {
        isSuccess = false;
        core.error(`FAIL: ${url} (desktop): ${desktopScore}`);
    }

    return {
        url,
        mobile: mobileScore,
        desktop: desktopScore,
    };
};

const score = (reports) => {
    const median = computeMedianRun(reports);

    return Math.floor(median.categories.performance.score * 100);
};

module.exports = { lighthouseReport };
