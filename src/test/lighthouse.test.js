const fs = require("fs");
const core = require("@actions/core");
const { lighthouseReport } = require("../main/lighthouse");
const config = require("../main/config");

jest.mock("@actions/core");
jest.mock("../main/config");

core.info = jest.fn().mockImplementation((message) => {
    console.log(message);
});
core.error = jest.fn().mockImplementation((message) => {
    console.error(message);
});
core.setFailed = jest.fn().mockImplementation((message) => {
    console.error(message);
});

config.urls = jest.fn().mockReturnValue(["https://www.google.com", "https://www.bbc.co.uk", "https://www.york.ac.uk"]);
config.iterations = jest.fn().mockReturnValue(2);
config.options = jest.fn().mockImplementation((port) => {
    return {
        output: "html",
        onlyCategories: ["performance"],
        port,
    };
});

const FIVE_MINUTES = 300_000;

describe("lighthouseReport", () => {
    beforeEach(() => {
        clearDownDir("./reports");
        clearDownDir("./results");
    });

    it(
        "Audits the list of input URLS and generates reports",
        async () => {
            const [scores, isSuccess] = await lighthouseReport();
            const numberOfReports = fs.readdirSync("./reports").length;
            const numberOfResultFiles = fs.readdirSync("./results").length;

            expect(isSuccess).not.toBeNull();
            expect(scores).toHaveLength(3);
            expect(scores[1].url).toBe("https://www.bbc.co.uk");
            expect(scores[1].desktop).not.toBeNull();
            expect(scores[1].mobile).not.toBeNull();
            expect(numberOfReports).toEqual(12);
            expect(numberOfResultFiles).toEqual(1);
        },
        FIVE_MINUTES
    );
});

const clearDownDir = (path) => {
    if (fs.existsSync(path)) {
        fs.rm(path, { recursive: true }, (error) => {
            if (error) {
                console.error(error);
            }
        });
    }
};
