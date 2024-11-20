// Importation de la classe POI pour les tests
const POI = require('../POI');

describe("Program Syntactic Testing of VpfParser", function () {


	beforeAll(function () {
		// Importation des modules nécessaires
		const POI = require('../POI');
		const VpfParser = require('../VpfParser');

		// Initialisation des objets de test
		this.analyzer = new VpfParser();
		this.pEmptyRating = new POI("Café d'Albert", 48.857735, 2.394987, []);
	});


	// Test de la lecture d'un nom depuis une entrée simulée
	it("can read a name from a simulated input", function () {
		const input = ["name", "Café d'Albert"];

		// Vérifie que la méthode name lit correctement un nom
		expect(this.analyzer.name(input)).toBe("Café d'Albert");
	});


	// Test de la lecture de coordonnées lat/lng depuis une entrée simulée
	it("can read a lat lng coordinate from a simulated input", function () {
		const input = ["latlng", "48.866205;2.399279"];

		// Vérifie que la méthode retourne des nombres pour les coordonnées
		const result = this.analyzer.latlng(input);
		expect(result).toEqual({ lat: 48.866205, lng: 2.399279 });
	});


	// Test pour vérifier la prise en compte des coordonnées GPS négatives
	it("can read negative lat lng coordinates from a simulated input", function () {
		// Entrée simulée avec des coordonnées négatives
		const input = ["latlng", "-34.6037;-58.3816"];

		// Vérifie que le parser retourne correctement des coordonnées négatives
		const result = this.analyzer.latlng(input);
		expect(result).toEqual({ lat: -34.6037, lng: -58.3816 });
	});


	// Test pour ajouter une note de classement (rating) valide
	it("can add a valid rating", function () {
		const poi = new POI("Test POI", 48.8566, 2.3522, []);
		this.analyzer.note(["note", "4"], poi);

		// Vérifie que la note valide est ajoutée
		expect(poi.ratings).toEqual([4]);
	});


	// Test pour ignorer les notes de classement (ratings) invalides
	it("ignores invalid ratings outside the range 0-5", function () {
		const poi = new POI("Test POI", 48.8566, 2.3522, []);
		this.analyzer.note(["note", "6"], poi); // Note invalide
		this.analyzer.note(["note", "-1"], poi); // Note invalide

		// Vérifie qu'aucune note invalide n'est ajoutée
		expect(poi.ratings).toEqual([]);
	});


	// Test pour créer un POI complet à partir d'une chaîne de description
	it("can create a complete POI from a description string", function () {
		const input = "START_POI\r\nname: Chez Gabin\r\nlatlng: 48.871794;2.379538\r\nnote: 3\r\nnote: 2\r\nEND_POI";
		const result = this.analyzer.parsePOI(input);

		// Vérifie que le POI est correctement créé
		expect(result).toEqual({
			name: "Chez Gabin",
			lat: 48.871794,
			lng: 2.379538,
			ratings: [3, 2]
		});
	});


	// Test pour la lecture de plusieurs classements (notes) d'un POI
	it("can read several rankings for a POI from a simulated input", function () {

		// Suggestion : Construire une entrée simulée pour un POI avec plusieurs notes
		const input = ["note", "3", "note", "4", "note", "2"];
		const curPoi = this.pEmptyRating;

		// Simuler la lecture des notes pour un POI
		input.forEach((symbol, idx) => {
			if (idx % 2 === 0) {
				this.analyzer.note([symbol, input[idx + 1]], curPoi);
			}
		});

		// Vérifier que les notes ont bien été ajoutées au POI
		expect(curPoi.ratings).toEqual([3, 4, 2]);

	});


});
