const fs = require('fs');
const colors = require('colors');
const VpfParser = require('./VpfParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
const cli = require("@caporal/core").default;
const { createCanvas } = require('canvas');

cli
	.version('0.07')
	.description('CLI for VPF file parsing and analysis')

	// Commande pour vérifier un fichier VPF
	.command('check', 'Check if <file> is a valid Vpf file')
	.argument('<file>', 'The file to check with Vpf parser')
	.option('-s, --showSymbols', 'Log the analyzed symbol at each step', { validator: cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'Log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({ args, options, logger }) => {
		fs.readFile(args.file, 'utf8', (err, data) => {
		if (err) return logger.warn(`Error reading file: ${err.message}`);

		const analyzer = new VpfParser(options.showTokenize, options.showSymbols);
		analyzer.parse(data);

		if (analyzer.errorCount === 0) {
			logger.info("The .vpf file is valid.".green);
		} else {
			logger.error("The .vpf file contains errors.".red);
		}
		logger.debug("Parsed POI data:", analyzer.parsedPOI);
		});
	})

	// Commande pour la recherche de texte dans les noms des POIs
	.command('search', 'Free text search on POIs\' names')
	.argument('<file>', 'The Vpf file to search')
	.argument('<needle>', 'Text to search in POI names')
	.action(({ args, logger }) => {
		fs.readFile(args.file, 'utf8', (err, data) => {
		if (err) return logger.warn(`Error reading file: ${err.message}`);

		const parser = new VpfParser();
		parser.parse(data);

		const results = parser.parsedPOI.filter(poi => poi.name.includes(args.needle));
		if (results.length > 0) {
			logger.info("Search results:");
			results.forEach(poi => logger.info(`Name: ${poi.name}, Lat: ${poi.lat}, Lng: ${poi.lng}`));
		} else {
			logger.info("No POI matches the search.");
		}
		});
	})

	// Commande pour calculer et afficher la moyenne des notes de chaque POI
	.command('average', 'Displays each POI with its average rating')
	.argument('<file>', 'The Vpf file to analyze')
	.action(({ args, logger }) => {
		fs.readFile(args.file, 'utf8', (err, data) => {
		if (err) return logger.warn(`Error reading file: ${err.message}`);

		const parser = new VpfParser();
		parser.parse(data);

		parser.parsedPOI.map(poi => {
			poi.average = poi.ratings.length ? poi.averageRatings() : 0;
			return poi;
		}).forEach(poi => logger.info(`Name: ${poi.name}, Average: ${poi.average.toFixed(2)}`));
		});
	})

	// Commande pour organiser les POIs par la première lettre de leur nom
	.command('abc', 'Organize POIs alphabetically by name\'s first letter')
	.argument('<file>', 'The Vpf file to analyze')
	.action(({ args, logger }) => {
		fs.readFile(args.file, 'utf8', (err, data) => {
			if (err) return logger.warn(`Error reading file: ${err.message}`);

			const parser = new VpfParser();
			parser.parse(data);

			const organized = parser.parsedPOI.reduce((acc, poi) => {
				const firstLetter = poi.name.charAt(0).toLowerCase();
				if (!acc[firstLetter]) {
					acc[firstLetter] = [];
				}
				acc[firstLetter].push(poi);
				return acc;
			}, {});

			Object.keys(organized).sort().forEach(letter => {
			logger.info(`${letter.toUpperCase()}:`);
			organized[letter].forEach(poi => {
				logger.info(`${poi.name}`);
			});
			});
		});
	})

	// Commande pour générer un graphique des moyennes des POI avec Vega-Lite
	.command('averageChart', 'Generate a Vega-Lite chart of POI average ratings')
	.alias('avgChart')
	.argument('<file>', 'The Vpf file to analyze')
	.action(({ args, logger }) => {
		fs.readFile(args.file, 'utf8', (err, data) => {
		if (err) return logger.warn(`Error reading file: ${err.message}`);

		const parser = new VpfParser();
		parser.parse(data);

		const avgData = parser.parsedPOI.map(poi => ({
			name: poi.name,
			averageRatings: poi.ratings.length ? poi.averageRatings() : 0
		}));

		const chartSpec = {
			"data": { "values": avgData },
			"mark": "bar",
			"encoding": {
			"x": { "field": "name", "type": "nominal", "axis": { "title": "POI Names" } },
			"y": { "field": "averageRatings", "type": "quantitative", "axis": { "title": "Average Ratings" } }
			}
		};

		const compiledSpec = vegalite.compile(chartSpec).spec;
		const runtime = vg.parse(compiledSpec);
		const view = new vg.View(runtime).renderer('svg').run();

		view.toSVG().then(svg => {
			fs.writeFileSync("./averageChart.svg", svg);
			logger.info("Generated chart saved to averageChart.svg");
		}).catch(err => logger.error(`Failed to generate SVG: ${err.message}`));
		});
	})

	// Commande pour afficher le README
	.command('readme', 'Display README.txt content')
	.action(({ logger }) => {
		fs.readFile('README.txt', 'utf8', (err, data) => {
		if (err) return logger.error("Error reading README.txt:", err.message);
		logger.info(data);
		});
	});

cli.run(process.argv.slice(2));
