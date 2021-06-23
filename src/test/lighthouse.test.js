const fs = require('fs');
const core = require("@actions/core");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const {computeMedianRun} = require("lighthouse/lighthouse-core/lib/median-run");
const mobileConfig = require("lighthouse/lighthouse-core/config/lr-mobile-config");
const desktopConfig = require("lighthouse/lighthouse-core/config/lr-desktop-config");

describe("lighthouse", () => {
    it("test", () => {
        expect(true);
    })
})