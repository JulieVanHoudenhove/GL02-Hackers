const fs = require('fs');
const path = require('path');


// Fonction pour charger et parser les questions depuis tous les fichiers d'un dossier
function chargerDossier(dossier) {
    try {
        const fichiers = fs.readdirSync(dossier); // Lire tous les fichiers du dossier
        let questions = [];

        // Parcourir chaque fichier et charger les questions
        fichiers.forEach(fichier => {
            const cheminFichier = path.join(dossier, fichier);

            // Vérifier que le fichier est bien un fichier .gift
            if (fs.statSync(cheminFichier).isFile() && path.extname(fichier) === '.gift') {
                const contenu = fs.readFileSync(cheminFichier, 'utf8');

                // Divise les questions en utilisant une regex qui trouve les blocs de questions
                const questionsBrutes = contenu.split(/(?=\n::)/); // Sépare les questions par le début d'une nouvelle ligne `::`

                // Parse chaque question et ajoute à la liste globale
                questions = questions.concat(
                    questionsBrutes.map((bloc) => parserQuestion(bloc.trim())).filter(q => q)
                );
            }
        });

        return questions;
    } catch (error) {
        console.error("Erreur lors du chargement des questions :", error.message);
        return [];
    }
}

// Fonction pour charger et parser les questions depuis un seul fichier
function chargerQuestions(fichier) {
    try {
        const cheminFichier = path.resolve(fichier);

        // Vérifier que le fichier est bien un fichier .gift
        if (fs.statSync(cheminFichier).isFile() && path.extname(fichier) === '.gift') {
            const contenu = fs.readFileSync(cheminFichier, 'utf8');

            // Divise les questions en utilisant une regex qui trouve les blocs de questions
            const questionsBrutes = contenu.split(/(?=\n::)/); // Sépare les questions par le début d'une nouvelle ligne `::`

            // Parse chaque question et ajoute à la liste globale
            const questions = questionsBrutes.map((bloc) => parserQuestion(bloc.trim())).filter(q => q);

            return questions;
        } else {
            console.error("Le fichier spécifié n'est pas un fichier .gift valide.");
            return [];
        }
    } catch (error) {
        console.error("Erreur lors du chargement de l'examen :", error.message);
        return [];
    }
}


// Fonction pour parser une question individuelle
function parserQuestion(bloc) {
    // Extraire le titre, l'énoncé, et les réponses (si présentes)
    const titreEtEnonce = bloc.match(/::(.*?)::([^{}]+)(\s*{[\s\S]*})?/);
    if (!titreEtEnonce) return null; // Si la question est mal formatée, on l'ignore

    const titre = titreEtEnonce[1].trim(); // Titre de la question
    const enonce = titreEtEnonce[2] ? titreEtEnonce[2].trim() : ""; // Énoncé de la question
    const reponsesBrutes = titreEtEnonce[3] ? titreEtEnonce[3].trim() : ""; // Réponses entre `{ }`

    // Passer l'énoncé en plus des réponses à la fonction infererType
    const type = infererType(reponsesBrutes, enonce); // Identifier le type de question

    let reponses = [];
    if (type === "Correspondance") {
        reponses = parserCorrespondance(reponsesBrutes);
    } else if (type === "Choix Multiple" || type === "Vrai/Faux" || type === "Numerique") {
        reponses = parserReponsesGenerales(reponsesBrutes);
    }
    else if (type === "Mot Manquant") {
        reponses = parserMotsManquants(enonce);
    }

    const result = {
        titre,
        enonce,
        type,
        reponses,
        contenu: bloc.trim(), // Contenu complet de la question
    };

    return result;
}

// Fonction pour inférer le type de la question en fonction des réponses
function infererType(reponses, question) {
    if (!reponses) {
        // Vérifier si la question contient un mot manquant (indiqué par des crochets [])
        if (/\[.*?\]/.test(question)) {
            return "Mot Manquant"; // Mot Manquant (par exemple, [Est])
        }
        return "Question Ouverte"; // Si aucune réponse détectée
    }

    // Vérification pour une question de type "Correspondance"
    if (/=\s*.*\s*->\s*.*\s*/.test(reponses)) {
        return "Correspondance"; // Correspondance
    }

    // Vérification pour une question de type "Vrai/Faux"
    if (/TRUE|FALSE/.test(reponses)) {
        return "Vrai/Faux"; // Vrai/Faux
    }

    // Vérification pour un choix multiple
    if (reponses.includes('=')) {
        return "Choix Multiple"; // Choix Multiple
    }

    // Vérification pour une réponse numérique (par exemple, {#42})
    if (/^{#\d+}/.test(reponses)) {
        return "Numerique"; // Réponse Numérique
    }

    return "Ce type de question n'est pas encore supporté"; // Si non reconnu
}

// Fonction pour parser les paires de correspondance
function parserCorrespondance(reponsesBrutes) {
    const paires = [];
    const lignes = reponsesBrutes.replace(/[{}]/g, '').trim().split('\n'); // Supprime les accolades et divise en lignes

    lignes.forEach((ligne) => {
        const match = ligne.match(/=\s*(.*?)\s*->\s*(.*?)\s*(#.*)?$/); // Capture TexteGauche et TexteDroit
        if (match) {
            paires.push({
                gauche: match[1].trim(),
                droit: match[2].trim()
            });
        }
    });

    return paires;
}

// Fonction générique pour parser les réponses (choix multiple, vrai/faux, etc.)
function parserReponsesGenerales(reponsesBrutes) {
    const reponses = [];
    const lignes = reponsesBrutes.replace(/[{}]/g, '').trim().split('\n'); // Supprime les accolades et divise en lignes

    lignes.forEach((ligne) => {
        const correct = ligne.startsWith('=');
        const texte = ligne.replace(/^=|~/, '').trim();
        reponses.push({ texte, correct });
    });

    return reponses;
}
function parserMotsManquants(enonce) {
    const motsManquants = [];
    const regex = /\[(.+?)\]/g; // Trouver tous les mots dans les crochets `[ ]`
    let match;

    while ((match = regex.exec(enonce)) !== null) {
        motsManquants.push({ texte: match[1].trim() }); // Extraire chaque mot et l'ajouter à la liste
    }

    return motsManquants;
}

module.exports = { chargerDossier, chargerQuestions };
