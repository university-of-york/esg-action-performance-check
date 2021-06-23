const { lighthouseReport } = require("../main/lighthouse");

describe("lighthouse", () => {
    it("test", () => {
        expect(lighthouseReport).not.toThrowError();
    });
});
