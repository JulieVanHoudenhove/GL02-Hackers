// Importation de POI
const POI = require('../POI');

// Test de l'attribut lastUpdate dans POI
describe("POI lastUpdate attribute", function () {
    let poi;

    // Avant chaque test, créer un nouveau POI
    beforeEach(function () {
        poi = new POI("Test POI", 48.8566, 2.3522, []);
        jasmine.clock().install(); // Installer la clock de Jasmine
    });

    afterEach(function () {
        jasmine.clock().uninstall(); // Désinstaller la clock de Jasmine après chaque test
    });

    it("should set lastUpdate when a new rating is added", function () {
        // Simuler l'heure actuelle
        const currentDate = new Date(2024, 10, 20); // 20 novembre 2024
        jasmine.clock().mockDate(currentDate);

        // Ajouter une note
        poi.addRating(4);

        // Vérifie que lastUpdate est bien mis à jour
        expect(poi.lastUpdate).toEqual("20/11/2024");
    });

    it("should update lastUpdate each time a new rating is added", function () {
        const currentDate1 = new Date(2024, 10, 20); // 20 novembre 2024
        jasmine.clock().mockDate(currentDate1);
        poi.addRating(4);

        const currentDate2 = new Date(2024, 10, 21); // 21 novembre 2024
        jasmine.clock().mockDate(currentDate2);
        poi.addRating(5);

        // Vérifie que lastUpdate a bien changé après l'ajout de la deuxième note
        expect(poi.lastUpdate).toEqual("21/11/2024");
    });
});
