class POI {
    /**
     * Constructor for POI
     * @param {string} name - Name of the POI
     * @param {number} lat - Latitude of the POI
     * @param {number} lng - Longitude of the POI
     * @param {Array<number>} ratings - Initial ratings for the POI
     */
    constructor(name, lat, lng, ratings = []) {
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.ratings = Array.isArray(ratings) ? ratings : [ratings];
    }

    /**
     * Calculate the average of the ratings.
     * @returns {number} - Average rating
     */
    averageRatings() {
        const total = this.ratings.reduce((sum, rating) => sum + parseFloat(rating), 0);
        return this.ratings.length > 0 ? total / this.ratings.length : 0;
    }

    /**
     * Add a new rating to the POI.
     * @param {number} rating - Rating to add
     */
    addRating(rating) {
        if (!isNaN(rating)) {
            this.ratings.push(parseFloat(rating));
        } else {
            console.error(`Invalid rating: ${rating}`);
        }
    }
}

module.exports = POI;
