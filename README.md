# Utilitaire de Gestion d'Examens GIFT

## Description
Cet utilitaire en ligne de commande permet de gérer des examens au format GIFT. Il offre diverses fonctionnalités pour la création, l'analyse et la gestion des examens, destinées aux enseignants et gestionnaires.

## Fonctionnalités Principales

1. **Recherche de Questions**
   - Recherche par mot-clé
   - Recherche par type de question
   - Affichage de toutes les questions disponibles

2. **Création d'Examen**
   - Sélection de questions
   - Vérification des critères (15-20 questions)
   - Détection des doublons
   - Sauvegarde au format GIFT

3. **Identification**
   - Création de fiche contact
   - Génération de VCard
   - Validation des informations personnelles

4. **Simulation d'Examen**
   - Passage d'examen test
   - Évaluation des réponses
   - Calcul du score

5. **Analyse de Profil d'Examen**
   - Visualisation des statistiques
   - Génération d'histogrammes
   - Comparaison avec d'autres examens

## Prérequis
- Node.js (version 12.0 ou supérieure)
- npm (gestionnaire de paquets Node.js)

## Installation

```bash
# Cloner le repository
git clone https://github.com/SAMY-EH/GL02_MACHINE_A24

# Accéder au répertoire
cd GL02_MACHINE_A24

# Installer les dépendances
npm install
```

## Utilisation

```bash
# Lancer l'application
node main.js
```

### Menu Principal
1. Rechercher une question
2. Créer un examen
3. S'identifier
4. Simuler la passation d'un examen
5. Comparer le profil d'un examen
6. Dresser le profil d'un examen
7. Quitter

## Structure des Fichiers

```
├── main.js              # Point d'entrée de l'application
├── functions.js         # Fonctions principales
├── parser.js           # Parseur de fichiers GIFT
├── graphGenerator.js   # Générateur de graphiques
├── questions.gift      # Base de questions
└── README.md          # Documentation
```

## Format des Fichiers

### Format GIFT
Les questions doivent suivre le format GIFT standard. Exemple :
```
::Titre de la question:: Question {
    =Bonne réponse
    ~Mauvaise réponse
    ~Autre mauvaise réponse
}
```

### Format VCard
Les fiches contact sont générées au format VCard standard (.vcf)
