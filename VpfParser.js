const POI = require('./POI');

// VpfParser Class
class VpfParser {
    /**
     * Constructor for VpfParser
     * @param {boolean} showTokenize - Whether to display tokenized data
     * @param {boolean} showParsedSymbols - Whether to display parsed symbols
     */
    constructor(showTokenize, showParsedSymbols) {
        this.parsedPOI = []; // List of parsed POIs
        this.symb = ["START_POI", "name", "latlng", "note", "END_POI", "$$"];
        this.showTokenize = showTokenize;
        this.showParsedSymbols = showParsedSymbols;
        this.errorCount = 0;
    }

    /**
     * Tokenize input data into a list of symbols.
     * @param {string} data - Input data to be tokenized
     * @returns {string[]} - Tokenized data as a list of symbols
     */
    tokenize(data) {
        const separator = /(\r\n|: )/;
        let tokens = data.split(separator);
        return tokens.filter(token => !token.match(separator));
    }

    /**
     * Parse the input data starting with the initial grammar rule.
     * @param {string} data - Input data to be parsed
     */
    parse(data) {
        const tokenizedData = this.tokenize(data);
        if (this.showTokenize) {
            console.log(tokenizedData);
        }
        this.listPoi(tokenizedData);
    }

    /**
     * Log an error message.
     * @param {string} msg - Error message
     * @param {string[]} input - Input causing the error
     */
    errMsg(msg, input) {
        this.errorCount++;
        console.error(`Parsing Error on ${input} -- msg: ${msg}`);
    }

    /**
     * Read and return the next symbol from input.
     * @param {string[]} input - The list of input symbols
     * @returns {string} - The next symbol
     */
    next(input) {
        const curSymbol = input.shift();
        if (this.showParsedSymbols) {
            console.log(curSymbol);
        }
        return curSymbol;
    }

    /**
     * Verify if the symbol is part of the language.
     * @param {string} s - Symbol to verify
     * @returns {number|boolean} - Symbol index or false if invalid
     */
    accept(s) {
        const idx = this.symb.indexOf(s);
        if (idx === -1) {
            this.errMsg(`Unknown symbol: ${s}`, []);
            return false;
        }
        return idx;
    }

    /**
     * Check whether the symbol is at the head of the input list.
     * @param {string} s - Symbol to check
     * @param {string[]} input - Input list
     * @returns {boolean} - True if match, else false
     */
    check(s, input) {
        return this.accept(input[0]) === this.accept(s);
    }

    /**
     * Expect the next symbol to match the given symbol.
     * @param {string} s - Expected symbol
     * @param {string[]} input - Input list
     * @returns {boolean} - True if matches, else false
     */
    expect(s, input) {
        if (s === this.next(input)) {
            return true;
        }
        this.errMsg(`Expected symbol: ${s}`, input);
        return false;
    }

    // Grammar Rules
    /**
     * <listPoi> ::= *(<poi>) "$$"
     */
    listPoi(input) {
        this.poi(input);
        this.expect("$$", input);
    }

    /**
     * <poi> ::= "START_POI" <body> "END_POI"
     */
    poi(input) {
        if (this.check("START_POI", input)) {
            this.expect("START_POI", input);
            const args = this.body(input);
            const poi = new POI(args.nm, args.lt, args.lg, []);
            this.note(input, poi);
            this.expect("END_POI", input);
            this.parsedPOI.push(poi);

            if (input.length > 0) {
                this.poi(input);
            }
        }
    }

    /**
     * <body> ::= <name> <latlng>
     */
    body(input) {
        const nm = this.name(input);
        const latlng = this.latlng(input);
        return { nm, lt: latlng.lat, lg: latlng.lng };
    }

    /**
     * <name> ::= "name: " [WCHAR+]
     */
    name(input) {
        this.expect("name", input);
        const curSymbol = this.next(input);
        const matched = curSymbol.match(/[\wàéèêîù'\s]+/i);
        if (matched) {
            return matched[0];
        }
        this.errMsg("Invalid name", input);
    }

    /**
     * <latlng> ::= "latlng: " [float],[float]
     */
    latlng(input) {
        const [lat, lng] = input[1].split(';').map(coord => coord.trim());
        if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            throw new Error('Invalid latlng format');
        }
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    /**
     * <note> ::= "note: " [0-5]
     */
    note(input, poi) {
        const rating = parseInt(input[1], 10);
        if (rating >= 0 && rating <= 5) { // Note valide entre 0 et 5
            poi.ratings.push(rating);
            poi.lastUpdate = new Date().toLocaleDateString('fr-FR'); // Mise à jour de lastUpdate
        }
    }

    parsePOI(input) {
        const lines = input.split('\r\n');
        const poi = { name: "", lat: null, lng: null, ratings: [] };

        lines.forEach(line => {
            if (line.startsWith("name: ")) {
                poi.name = line.split("name: ")[1].trim();
            } else if (line.startsWith("latlng: ")) {
                const [lat, lng] = line.split("latlng: ")[1].split(';').map(parseFloat);
                poi.lat = lat;
                poi.lng = lng;
            } else if (line.startsWith("note: ")) {
                const rating = parseInt(line.split("note: ")[1], 10);
                if (rating >= 0 && rating <= 5) {
                    poi.ratings.push(rating);
                }
            }
        });

        return poi;
    }
}

module.exports = VpfParser;
