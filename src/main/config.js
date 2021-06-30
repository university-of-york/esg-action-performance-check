const core = require("@actions/core");

const DEFAULT_ITERATIONS = 5;
const DEFAULT_THRESHOLD = 80;

const options = (port) => {
    return {
        output: "html",
        onlyCategories: ["performance"],
        port,
    };
};

const urls = () => core.getInput("urls").split("\n");

const iterations = () => {
    return core.getInput("iterations") ? core.getInput("iterations") : DEFAULT_ITERATIONS;
};

const desktopThreshold = () => {
    return core.getInput("minimum-desktop-score") ? core.getInput("minimum-desktop-score") : DEFAULT_THRESHOLD;
};

const mobileThreshold = () => {
    return core.getInput("minimum-mobile-score") ? core.getInput("minimum-mobile-score") : DEFAULT_THRESHOLD;
};

module.exports = { options, urls, iterations, desktopThreshold, mobileThreshold };
