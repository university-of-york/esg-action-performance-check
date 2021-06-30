const fs = require("fs");
const { lighthouseReport } = require("../main/lighthouse");

process.env.INPUT_ITERATIONS = 2;
process.env.INPUT_URLS = "https://www.google.com\nhttps://www.bbc.co.uk\nhttps://www.york.ac.uk\n";

describe("lighthouseReport", () => {
    beforeEach(() => {
        clearDownDir("./reports");
        clearDownDir("./results");
    });

    it("Audits the list of input URLS and generates reports", async () => {
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
    }, 300_000);
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
