// Définition de la classe POI
const POI = function(name, lat, lng, ratings = []) {
    this.name = name; // Nom du POI
    this.lat = lat; // Latitude
    this.lng = lng; // Longitude
    this.ratings = Array.isArray(ratings) ? ratings : [ratings]; // Liste des notes
};

// Calcul de la note moyenne du POI
POI.prototype.averageRatings = function() {
    const total = this.ratings.reduce((acc, rating) => acc + parseInt(rating, 10), 0);
    return this.ratings.length > 0 ? total / this.ratings.length : 0;
};

// Ajout d'une note à la liste des notes
POI.prototype.addRating = function(rating) {
    this.ratings.push(rating);
};

module.exports = POI;
