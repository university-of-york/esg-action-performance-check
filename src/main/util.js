
const colourForScore = (score, threshold) => {
    if (!score || !threshold) return "lightgrey";

    if (score < threshold) {
        return "red"
    } else if (score === threshold) {
        return "orange"
    } else if ((score > threshold) && (score >= 90)) {
        return "brightgreen"
    } else if (score >= threshold + 10) {
        return "green"
    } else if ((score > threshold) && (score <= threshold + 10)) {
        return "yellow"
    }
}

module.exports = {colourForScore}
