#!/usr/bin/env node
var app = require('commander');

function handleError(action, err) {
    if (err) {
        console.error('error while ' + action + '...');
        console.error(err);
    }
}

app.version('0.1.0');

app.command('test').action(function() {
    var Docker = require('dockerode'),
        docker = new Docker();

    docker.createContainer({
        Image: 'ubuntu',
        Cmd: ['/bin/ls', '/tmp/app'],
        Volumes: {
            '/tmp/app': {}
        }
    }, function(err, container) {
        console.log('attaching to... ' + container.id);

        container.attach({stream: true, stdout: true, stderr: true, tty: true}, function(err, stream) {
            handleError('attaching', err);

            stream.pipe(process.stdout);

            console.log('starting... ' + container.id);

            container.start({
                Binds: ['/Users/glevine/www:/tmp/app']
            }, function(err, data) {
                handleError('starting', err);
            });

            container.wait(function(err, data) {
                handleError('waiting', err);

                console.log('killing... ' + container.id);

                container.kill(function(err, data) {
                    handleError('killing', err);

                    console.log('removing... ' + container.id);

                    container.remove(function(err, data) {
                        handleError('removing', err);
                    });
                });
            });
        });
    });
});

app.parse(process.argv);
