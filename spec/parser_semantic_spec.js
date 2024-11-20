// Importation de la classe POI pour les tests
const POI = require('../POI');

describe("Program Semantic Testing of POI", function () {


	// Initialisation de l'objet POI avant tous les tests
	beforeAll(function () {
		this.p = new POI("Café d'Albert", 48.857735, 2.394987, [1, 3, 2]);
	});


	// Test de la création d'un nouvel objet POI
	it("can create a new POI", function () {
		// Vérifie que l'objet a été correctement créé
		expect(this.p).toBeDefined();

		// Vérifie les propriétés de l'objet
		expect(this.p.name).toBe("Café d'Albert");

		// Utilisation de `objectContaining` pour vérifier une correspondance partielle
		expect(this.p).toEqual(jasmine.objectContaining({ name: "Café d'Albert" }));
	});


	// Test de l'ajout d'une nouvelle note de classement
	it("can add a new rating", function () {
		// Ajout d'une nouvelle note
		this.p.addRating(2);

		// Vérifie que la note a été ajoutée correctement
		expect(this.p.ratings).toEqual([1, 3, 2, 2]);
	});


	// Test pour calculer la moyenne des évaluations
	it("can calculate the average rating", function () {
		// Appel de la méthode average()
		const avgRating = this.p.averageRatings();

		// Vérifie que la moyenne est calculée correctement
		expect(avgRating).toBe(2); // (1 + 3 + 2) / 3 = 2
	});


});
