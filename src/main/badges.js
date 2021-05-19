const passFailBadge = (success) => {
    if (success == null) return '';

    const text = success ? "PASSED" : "FAILED";
    const colour = success ? "brightgreen" : "red";

    return `<img src="https://img.shields.io/badge/Build-${text}-${colour}"/>`
}

const performanceBadges = (scores) => {
    if (scores == null) return '';

    const mobileSum = scores.reduce((sum, score) => sum + score.mobile, 0);
    const desktopSum = scores.reduce((sum, score) => sum + score.desktop, 0);

    const averageMobileScore = Math.floor(mobileSum / scores.length);
    const averageDesktopScore = Math.floor(desktopSum / scores.length);

    const mobileColour = colourForScore(averageMobileScore);
    const desktopColour = colourForScore(averageDesktopScore);

    return `<img src="https://img.shields.io/badge/Average_Mobile_Performance-${averageMobileScore}-${mobileColour}"/>  
            <img src="https://img.shields.io/badge/Average_Desktop_Performance-${averageDesktopScore}-${desktopColour}"/>`
}

const colourForScore = (score) => {
    if (!score || isNaN(score)) return "lightgrey";

    if (score >= 90) {
        return "brightgreen"
    } else if (score >= 80) {
        return "green"
    } else if (score >= 60) {
        return "yellow"
    } else if (score >= 40) {
        return "orange"
    } else {
        return "red"
    }
}

module.exports = {passFailBadge, performanceBadges, colourForScore}
