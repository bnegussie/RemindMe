// Clearing the minutes, seconds, and milliseconds of the given date.
// Returns the Date object in milliseconds form.
function ClearDateMinAndSecAndMill(givenDate) {
    const dateObj = new Date( ClearDateSecAndMill(givenDate) );
    dateObj.setMinutes(0);
    return dateObj.getTime();
}

// Clears out the seconds and milliseconds of a Date object and
// returns the Date object in milliseconds form.
// This is a very critical action when comparing dates.
function ClearDateSecAndMill(givenDate) {
    if (!givenDate) {
        givenDate = new Date();
    }
    const dateObj = new Date(givenDate);
    dateObj.setSeconds(0);
	dateObj.setMilliseconds(0);
    return dateObj.getTime();
}

export { ClearDateSecAndMill, ClearDateMinAndSecAndMill };
