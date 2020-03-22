const { exec } = require('child_process');

module.exports.extractJson = function extractJson(source, target, callback) {
    const spawn = exec(`head -n -2 ${source} | tail -n +4 > ${target}`, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        }
        console.log('Child Process STDOUT: ' + stdout);
        console.log('Child Process STDERR: ' + stderr);
    });

    spawn.on('exit', function (code) {
        console.log('Child process exited with exit code ' + code);
        callback();
    });

    return spawn;
};

