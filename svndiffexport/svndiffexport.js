var path = require('path'),
    mkdirp = require('mkdirp'),
    fs = require('fs');

// Parse arguments from command line
var args, spawn;
spawn = require('child_process').spawn;

args = parseArgs(process.argv);
console.log(args);

// Validate arguments
if (!isValidArgs(args)) {
    console.error('Invalid arguments: ' + '[' + process.argv + ']');
    usage();
    process.exit(-1);
}

// Generate filelist to be export, and export them
// generate, mksirs, export
generateFilelist(args, exportFiles);

// Export files from filelist
//exportFiles(filelist, args['targetDir']);

function usage() {
    console.error('Usage: ' + process.argv[0] + ' ' + process.argv[1] + 
            ' --from revison --to revison --base dir --target dir');
}

function parseArgs(argv) {
    var args, i;
    args = {};
    for (i = 0; i < argv.length; i++) {
        if (argv[i] === '--from') {
            args['from'] = argv[++i];
        } else if (argv[i] === '--to') {
            args['to'] = argv[++i];
        } else if (argv[i] === '--base') {
            args['base'] = argv[++i];
        } else if (argv[i] === '--target') {
            args['target'] = argv[++i];
        }
    }

    return args;
}

function isValidArgs(args) {
    var requiredArgs, i;
    requiredArgs = ['from', 'to', 'base', 'target'];

    for (i = 0; i < requiredArgs.length; i++) {
        if (!args[requiredArgs[i]]) {
            return false;
        }
    }

    return true;
}

function generateFilelist(args, fnSuccess) {
    var diffChild;
    diffChild  = spawn('svn', ['diff', '--summarize', '-r', args['from'] + ':' + args['to'], args['base']]);

    diffChild.on('exit', function (code) {
        // error
        if (code) {
            console.error('[error: ' + code + ']svn diff failed');
            process.exit(-1);
        } else {
            diffChild.stdout.on('data', function (data) {
                console.log('[svn diff] ' + data);
                var lines, i, filelist, patt;

                lines  = data.toString().split('\n');
                filelist = [];
                // Only export added/modified files
                patt = /^[AM]\s+/;

                for (i = 0; i < lines.length; i++) {
                    if (patt.test(lines[i])) {
                        // extract file path
                        filelist.push(lines[i].replace(patt, '').trim());
                    }
                }

                // call callback
                fnSuccess(args, filelist);
            });
        }
    });
}

function exportFiles(args, filelist) {
    var i;

    // mkdir and export
    for (i = 0; i < filelist.length; i++) {
        var fromFileName,
            targetDir,
            targetFileName,
            regExp = new RegExp('^' + args['base']),
            targetDir = args['target'];

        fromFileName = filelist[i];

        if (fs.lstatSync(fromFileName)) {
            // For directory, just mkdir
            targetDir = fromFileName.replace(regExp, targetDir);
            mkdirp.sync(targetDir);

        } else {
            // Normal files
            // mkdir
            targetFileName = fromeFileName.repalce(regExp, targetDir);
            targetDir = path.dirname(targetFileName);
            mkdirp.sync(targetDir);

            // copy file
            fs.createReadSream(fromFileName).pipe(fs.createWriteStream(targetFileName));
        }
    }

    return 0;
}
