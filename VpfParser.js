const POI = require('./POI');

// VpfParser Class Definition
var VpfParser = function(sTokenize, sParsedSymb) {
    this.parsedPOI = []; // Liste des POIs analysés à partir du fichier d'entrée
    this.symb = ["START_POI", "name", "latlng", "note", "END_POI", "$$"]; // Symboles valides
    this.showTokenize = sTokenize; // Option d'affichage de la tokenisation
    this.showParsedSymbols = sParsedSymb; // Option d'affichage des symboles analysés
    this.errorCount = 0; // Compteur d'erreurs
};

// Tokenize - Transforme l'entrée en une liste de tokens
VpfParser.prototype.tokenize = function(data) {
    const separator = /(\r\n|: )/;
    data = data.split(separator).filter(val => !val.match(separator));
    return data;
};

// Parse - Analyse les données en appelant la première règle de grammaire
VpfParser.prototype.parse = function(data) {
    const tData = this.tokenize(data);
    if (this.showTokenize) {
        console.log(tData);
    }
    this.listPoi(tData);
};

// Affiche un message d'erreur et incrémente le compteur d'erreurs
VpfParser.prototype.errMsg = function(msg, input) {
    this.errorCount++;
    console.log(`Parsing Error on ${input} -- msg: ${msg}`);
};

// Retourne et affiche (si configuré) le prochain symbole de l'entrée
VpfParser.prototype.next = function(input) {
    const curS = input.shift();
    if (this.showParsedSymbols) {
        console.log(curS);
    }
    return curS;
};

// Vérifie si le symbole est dans la liste des symboles acceptés
VpfParser.prototype.accept = function(s) {
    const idx = this.symb.indexOf(s);
    if (idx === -1) {
        this.errMsg(`Unknown symbol: ${s}`, [" "]);
        return false;
    }
    return idx;
};

// Vérifie si le symbole en tête de liste correspond à l'argument
VpfParser.prototype.check = function(s, input) {
    return this.accept(input[0]) === this.accept(s);
};

// Attend que le prochain symbole corresponde à l'argument
VpfParser.prototype.expect = function(s, input) {
    if (s === this.next(input)) {
        return true;
    } else {
        this.errMsg(`Symbol ${s} doesn't match`, input);
        return false;
    }
};

// Parser Rules

// <listPoi> = *(<poi>) "$$"
VpfParser.prototype.listPoi = function(input) {
    this.poi(input);
    this.expect("$$", input);
};

// <poi> = "START_POI" <eol> <body> "END_POI"
VpfParser.prototype.poi = function(input) {
    if (this.check("START_POI", input)) {
        this.expect("START_POI", input);
        const args = this.body(input);
        const poi = new POI(args.nm, args.lt, args.lg, []);
        this.note(input, poi);
        this.expect("END_POI", input);
        this.parsedPOI.push(poi);

        // Récurse sur l'élément suivant
        if (input.length > 0) {
            this.poi(input);
        }
        return true;
    }
    return false;
};

// <body> = <name> <eol> <latlng> <eol> <optional>
VpfParser.prototype.body = function(input) {
    const name = this.name(input);
    const latlng = this.latlng(input);
    return { nm: name, lt: latlng.lat, lg: latlng.lng };
};

// <name> = "name: " 1*WCHAR
VpfParser.prototype.name = function(input) {
    this.expect("name", input);
    const curS = this.next(input);
    const matched = curS.match(/[\wàéèêîù'\s]+/i);
    if (matched) {
        return matched[0];
    } else {
        this.errMsg("Invalid name", input);
    }
};

// <latlng> = "latlng: " ?"-" 1*3DIGIT "." 1*DIGIT", " ?"-" 1*3DIGIT "." 1*DIGIT
VpfParser.prototype.latlng = function(input) {
    this.expect("latlng", input);
    const curS = this.next(input);
    const matched = curS.match(/(-?\d+(\.\d+)?);(-?\d+(\.\d+)?)/);
    if (matched) {
        return { lat: matched[1], lng: matched[3] };
    } else {
        this.errMsg("Invalid latlng", input);
    }
};

// <note> = "note: " "0"/"1"/"2"/"3"/"4"/"5"
VpfParser.prototype.note = function(input, curPoi) {
    if (this.check("note", input)) {
        this.expect("note", input);
        const curS = this.next(input);
        const matched = curS.match(/[12345]/);
        if (matched) {
            curPoi.addRating(matched[0]);
            if (input.length > 0) {
                this.note(input, curPoi);
            }
        } else {
            this.errMsg("Invalid note", input);
        }
    }
};

module.exports = VpfParser;
