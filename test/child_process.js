var spawn = require('child_process').spawn,
    //child = spawn('ping', ['-c', '3', 'baidu.com']),
    child = spawn('sleep', ['10']),
    waitpid = require('waitpid');

console.log('Spawned child pid: ' + child.pid);

child.on('exit', function (code) {
    console.log('child process exit with code ' + code);
    //process.exit(1);
    child.stdout.on('data', function (data) {
        console.log('[exit] ' + data + '[/exit]');
    });
});

/*child.stdout.on('data', function (data) {
    console.log('child stdout data: ' + data);
});*/

child.stderr.on('data', function (data) {
    console.log('child sdterr data: ' + data);
});

var status = waitpid(child.pid);
console.log('Exit status: ' + status);
