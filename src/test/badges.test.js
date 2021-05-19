const {passFailBadge, performanceBadges, colourForScore} = require("../main/badges");

describe("passFailBadge", () => {

    const data = [
        [true, "<img src=\"https://img.shields.io/badge/Build-PASSED-brightgreen\"/>"],
        [false, "<img src=\"https://img.shields.io/badge/Build-FAILED-red\"/>"],
        [null, ""],
    ];

    test.each(data)(
        "Correctly constructs badge when success is %s",
        (success, expectedBadge) => {
            expect(passFailBadge(success)).toEqual(expectedBadge);
        }
    )
});

describe("performanceBadges", () => {
    it("Correctly constructs performance badges", () => {

        const scores = [
            {
                mobile: 80,
                desktop: 20,
            },
            {
                mobile: 60,
                desktop: 30,
            },
            {
                mobile: 40,
                desktop: 40,
            },
        ];

        const expectedMobileBadge = "<img src=\"https://img.shields.io/badge/Average_Mobile_Performance-60-yellow\"/>";
        const expectedDesktopBadge = "<img src=\"https://img.shields.io/badge/Average_Desktop_Performance-30-red\"/>";

        const html = performanceBadges(scores);

        expect(html).toContain(expectedMobileBadge);
        expect(html).toContain(expectedDesktopBadge);

    });
});

describe("colourForScore", () => {

    const data = [
        [95, "brightgreen"],
        [90, "brightgreen"],
        [85, "green"],
        [80, "green"],
        [70, "yellow"],
        [60, "yellow"],
        [50, "orange"],
        [40, "orange"],
        [30, "red"],
        [20, "red"],
        ["not a number", "lightgrey"],
        [null, "lightgrey"],
    ];

    test.each(data)(
        "Performance score of %i gives colour: %s",
        (score, expectedColour) => {
            expect(colourForScore(score)).toEqual(expectedColour);
        }
    )
});
