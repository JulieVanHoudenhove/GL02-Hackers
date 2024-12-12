const readline = require("readline");
const fs = require("fs");
const {
  rechercherQuestion,
  creerExamen,
  identification,
  simulerPassation,
  comparerProfilExamen,
  dresserProfil,
} = require("./fonctions");

// Supprimer le fichier temporaire au démarrage
if (fs.existsSync("./temp_examen.json")) {
  fs.unlinkSync("./temp_examen.json");
}

// Interface utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Menu principal
function afficherMenu() {
  console.log("\n--- Menu Principal ---");
  console.log("1. Rechercher une question");
  console.log("2. Créer un examen");
  console.log("3. S'identifier");
  console.log("4. Simuler la passation d'un examen");
  console.log("5. Comparer le profil d'un examen");
  console.log("6. Dresser le profil d'un examen");
  console.log("7. Quitter");

  rl.question("\nChoisissez une option : ", (choix) => {
    switch (choix) {
      case "1":
        rechercherQuestion(rl, afficherMenu);
        break;
      case "2":
        creerExamen(rl, afficherMenu);
        break;
      case "3":
        identification(rl, afficherMenu);
        break;
      case "4":
        simulerPassation(rl, afficherMenu);
        break;
      case "5":
        comparerProfilExamen(rl, afficherMenu);
        break;
      case "6":
        dresserProfil(rl, afficherMenu);
        break;
      case "7":
        console.log("\nMerci d'avoir utilisé l'utilitaire. À bientôt !");
        rl.close();
        break;
      default:
        console.log("\nOption invalide. Veuillez choisir une option valide.");
        afficherMenu();
    }
  });
}

// Début du programme
afficherMenu();
//./examens/examen.gift
// Paris -> France; Berlin -> Allemagne; Tokyo -> Japon