### README - Analyseur Verbose POI Format (VPF) - TP GL02


Description : Ce projet fournit un analyseur récursif descendant, implémenté en JavaScript, pour lire et traiter les fichiers au format Verbose POI Format (VPF). Ce format permet de décrire une liste de Points d'Intérêt (POI) accompagnés d'une liste d'évaluations. Les fichiers sont au format texte et doivent respecter la grammaire suivante :


<liste_poi> = *(<poi> <eol>) "$$"
<poi> = "START_POI" <eol> <body> "END_POI"
<body> = <name> <eol> <latlng> <eol> <optional>
<optional> = *(<note> <eol>)
<name> = "name: " 1*WCHAR
<latlng> = "latlng: " ?"-" 1*3DIGIT "." 1*DIGIT ";" ?"-" 1*3DIGIT "." 1*DIGIT
<note> = "note: " "0"/"1"/"2"/"3"/"4"/"5"
<eol> = CRLF


### Installation

$ npm install


### Utilisation

$ node caporalCli.js <command> fileToParse [-hts]

<command> : check

-h or --help 	:	 display the program help
-t or --showTokenize :	 display the tokenization result 
-s or --showSymbols :	 display each step of the analysis

Les paramètres optionnels doivent être placés avant le paramètre obligatoire fichierÀAnalyser.


### Version : 

# 0.07

- Migration vers Caporal 2.0.

# 0.06

- Ajout de la visualisation et export avec Vega-Lite.

# 0.05

- Utilisation de Caporal.js pour gérer la CLI.

# 0.04

- Séparation de la CLI dans un module à part (cli.js).
- Refactoring de POI et VpfParser.

# 0.03

- Ajout d'une option help pour lire le README depuis la console.
- Mode verbose pour suivre le fonctionnement de l'analyseur.

# 0.02

- Prise en charge des notes.
- Création d'une liste d'objets POI pour permettre un traitement ultérieur.

# 0.01

- Parse les fichiers simples du jeu de test (se termine avec une erreur).
- Gestion des noms de POI sans espaces.

TODO :

- Modification de la grammaire (à vérifier).
- Ajout de tests unitaires dans ./test/unit (utilise qunit - exécuter avec testRunner.js).
- Ajout d'une option pour afficher chaque POI avec sa note moyenne.


### Liste des contributeurs
M. Tixier (matthieu.tixier@utt.fr)