#!/usr/bin/env node
var app = require('commander'),
    _ = require('lodash-node'),
    fs = require('fs-extra'),
    child_process = require('child_process');

function home() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function done(container, volume) {
    container.kill(function(err, data) {
        container.remove(function(err, data) {
            fs.removeSync(volume);
            process.exit(0);
        });
    });
}

app.version('0.1.0');

app.command('test').action(function() {
    var Docker = require('dockerode'),
        docker = new Docker(),
        options = {
            Image: 'dockerfile/mysql',
            Volumes: {
                '/app': {}
            }
        };

    var pathToApp = _.chain(options.Volumes).keys().first().value();

    docker.pull(options.Image, function(err, stream) {  
        docker.createContainer(options, function(err, container) {
            var volume = home() + '/sugar/' + container.id;

            fs.mkdirsSync(volume);

            child_process.spawn(__dirname + '/bin/build.sh', ['-d', volume]).on('close', function(code) {
                container.start({
                    Binds: [volume + ':' + pathToApp + ':rw']
                }, function(err, data) {
                    //TODO: exec the installation and running karma and phpunit, waiting on each to finish before starting the next one
                    //TODO: kill and remove the container after phpunit is done
                    container.exec({
                        AttachStdout: true,
                        AttachStderr: true,
                        Tty: false,
                        Cmd: ['/bin/ls', pathToApp]
                    }, function(err, exec) {
                        exec.start(function(err, stream) {
                            stream.setEncoding('utf8');
                            stream.pipe(process.stdout);
                            stream.on('end', function() {
                                done(container, volume);
                            });
                        });
                    });
                });
            });
        });
    });
});

app.parse(process.argv);
