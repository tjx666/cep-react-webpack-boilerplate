import yargs from 'yargs';

const args = yargs(process.argv.slice(2))
    .options({
        all: { type: 'boolean', default: false },
        analyze: { type: 'boolean', default: false },
    })
    .parseSync();

export default args;
