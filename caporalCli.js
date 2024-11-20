const fs = require('fs');
const colors = require('colors'); // For colored console logs
const VpfParser = require('./VpfParser.js'); // Custom VPF parser module

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;

cli
    .version('vpf-parser-cli')
    .version('0.07')

    // Command: Check VPF file
    .command('check', 'Check if <file> is a valid VPF file')
    .argument('<file>', 'The file to validate with the VPF parser')
    .option('-s, --showSymbols', 'Log analyzed symbols during parsing', { validator: cli.BOOLEAN, default: false })
    .option('-t, --showTokenize', 'Log tokenization results', { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {
        fs.readFile(args.file, 'utf8', (err, data) => {
            if (err) return logger.warn(err);

            const parser = new VpfParser(options.showTokenize, options.showSymbols);
            parser.parse(data);

            if (parser.errorCount === 0) {
                logger.info("The file is a valid VPF file.".green);
            } else {
                logger.info("The file contains errors.".red);
            }

            logger.debug(parser.parsedPOI);
        });
    })

    // Command: Display README
    .command('readme', 'Display the README.txt file')
    .action(({ logger }) => {
        fs.readFile('./README.txt', 'utf8', (err, data) => {
            if (err) return logger.warn(err);

            logger.info(data);
        });
    })

    // Command: Search POIs by name
    .command('search', 'Search for POIs by name')
    .argument('<file>', 'The VPF file to search')
    .argument('<needle>', 'Text to search for in POI names')
    .action(({ args, logger }) => {
        fs.readFile(args.file, 'utf8', (err, data) => {
            if (err) return logger.warn(err);

            const parser = new VpfParser();
            parser.parse(data);

            if (parser.errorCount === 0) {
                const regex = new RegExp(args.needle, 'i');
                const results = parser.parsedPOI.filter(p => regex.test(p.name));
                logger.info("%s", JSON.stringify(results, null, 2));
            } else {
                logger.info("The file contains errors.".red);
            }
        });
    })

    // Command: Calculate average ratings
    .command('average', 'Calculate average ratings for each POI')
    .alias('avg')
    .argument('<file>', 'The VPF file to analyze')
    .action(({ args, logger }) => {
        fs.readFile(args.file, 'utf8', (err, data) => {
            if (err) return logger.warn(err);

            const parser = new VpfParser();
            parser.parse(data);

            if (parser.errorCount === 0) {
                const averages = parser.parsedPOI.map(p => ({
                    ...p,
                    averageRatings: p.ratings.length
                        ? p.ratings.reduce((sum, r) => sum + parseInt(r), 0) / p.ratings.length
                        : 0,
                }));
                logger.info("%s", JSON.stringify(averages, null, 2));
            } else {
                logger.info("The file contains errors.".red);
            }
        });
    })

    // Command: Generate average ratings chart
    .command('averageChart', 'Generate a Vega-lite chart for average ratings')
    .alias('avgChart')
    .argument('<file>', 'The VPF file to analyze')
    .action(({ args, logger }) => {
        fs.readFile(args.file, 'utf8', (err, data) => {
            if (err) return logger.warn(err);

            const parser = new VpfParser();
            parser.parse(data);

            if (parser.errorCount === 0) {
                const averages = parser.parsedPOI.map(p => ({
                    ...p,
                    averageRatings: p.ratings.length
                        ? p.ratings.reduce((sum, r) => sum + parseInt(r), 0) / p.ratings.length
                        : 0,
                }));

                const chartSpec = {
                    data: { values: averages },
                    mark: "bar",
                    encoding: {
                        x: { field: "name", type: "nominal", axis: { title: "POI Name" } },
                        y: { field: "averageRatings", type: "quantitative", axis: { title: "Average Ratings" } },
                    },
                };

                const compiledChart = vegalite.compile(chartSpec).spec;
                const runtime = vg.parse(compiledChart);
                const view = new vg.View(runtime).renderer('svg').run();

                view.toSVG()
                    .then(svg => {
                        fs.writeFileSync('./result.svg', svg);
                        logger.info("Chart generated: ./result.svg");
                    })
                    .catch(err => logger.warn(err))
                    .finally(() => view.finalize());
            } else {
                logger.info("The file contains errors.".red);
            }
        });
    })

    // Command: Group POIs alphabetically
    .command('abc', 'Group POIs by the first letter of their name')
    .argument('<file>', 'The VPF file to group')
    .action(({ args, logger }) => {
        fs.readFile(args.file, 'utf8', (err, data) => {
            if (err) return logger.warn(err);

            const parser = new VpfParser();
            parser.parse(data);

            if (parser.errorCount === 0) {
                const grouped = parser.parsedPOI.reduce((acc, p) => {
                    const key = p.name.charAt(0).toUpperCase();
                    acc[key] = acc[key] || [];
                    acc[key].push(p);
                    return acc;
                }, {});

                logger.info("%s", JSON.stringify(grouped, null, 2));
            } else {
                logger.info("The file contains errors.".red);
            }
        });
    });

cli.run(process.argv.slice(2));
