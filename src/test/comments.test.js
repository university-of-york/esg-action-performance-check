const { generateComment } = require("../main/comments");

describe("generateComment", () => {
    it.each([
        [90, 80, true],
        [40, 50, true],
        [80, 70, false],
        [20, 30, false],
    ])("Generates a comment that matches snapshot (%d, %d, %s)", (desktopScore, mobileScore, isSuccess) => {
        const scores = [
            {
                url: "http://localhost:3000/home",
                desktop: desktopScore,
                mobile: mobileScore,
            },
            {
                url: "http://localhost:3000/page",
                desktop: desktopScore * 2,
                mobile: mobileScore * 0.5,
            },
        ];

        expect(generateComment(scores, isSuccess)).toMatchSnapshot();
    });
});
