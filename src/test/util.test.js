const {colourForScore} = require("../main/util");

describe("colourForScore", () => {
    it("Selects red if score is less than threshold", () => {
        expect(colourForScore(62, 70)).toEqual("red");
    });

    it("Selects orange if score is equal to threshold", () => {
        expect(colourForScore(70, 70)).toEqual("orange");
    });

    it("Selects yellow if score greater than threshold, within 10%", () => {
        expect(colourForScore(76, 70)).toEqual("yellow");
    });

    it("Selects green if score is greater than threshold by at least 10%", () => {
        expect(colourForScore(84, 70)).toEqual("green");
    });

    it("Selects brightgreen if score is greater than threshold and 90%", () => {
        expect(colourForScore(92, 70)).toEqual("brightgreen");
    });

    it("Selects lightgrey if score is null", () => {
        expect(colourForScore(null, 70)).toEqual("lightgrey");
    });

    it("Selects lightgrey if threshold is null", () => {
        expect(colourForScore(60, null)).toEqual("lightgrey");
    });

    it("Selects lightgrey if both score and threshold are null", () => {
        expect(colourForScore(null, null)).toEqual("lightgrey");
    });
});
