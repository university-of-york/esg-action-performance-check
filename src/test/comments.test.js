const { generateComment, findComment } = require("../main/comments");

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

describe("findComment", () => {
    it("Finds the correct comment to update", () => {
        const comments = {
            data: [
                {
                    id: 1,
                    user: { login: "author" },
                    body: "Hello this is my PR, welcome and have fun!",
                },
                {
                    id: 2,
                    user: { login: "github-actions[bot]" },
                    body: "<html>This is the performance score comment<sub>performance-check-action</sub></html>",
                },
                {
                    id: 3,
                    user: { login: "reviewer" },
                    body: "Lovely code, very nice, what great performance scores!",
                },
            ],
        };

        expect(findComment(comments)).toEqual(2);
    });
});
