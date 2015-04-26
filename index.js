var nodemiral = require('nodemiral'),
    c = require('chalk'),
    fs = require('fs'),
    sshPrivateKey = fs.readFileSync(process.env.KEY || process.env.HOME + '/.ssh/id_rsa', 'utf8'),
    Client = require('ssh2').Client,
    conn = new Client();


//        var cmd = 'zfs list -H -o name -s used';

var remote = process.env.HOST || 'localhost';
Local = {
    Host: '',
    Port: 22322,
};
var Remote = {
    Host: remote,
    Cmd: 'mbuffer -s 128k -m 1G -I ' + Local.Host + ':' + Local.Port + ' | zfs receive -vF ' + Local.Filesystem
};

conn.on('ready', function() {
    console.log(c.green('SSH Connected to ', Remote.Host));
    var o = [];
    conn.exec(Remote.Cmd, function(err, stream) {
        if (err) throw err;
        console.log(c.green('Running Command: \n\n\t\t' + Remote.Cmd + '\n\n'));

        stream.on('close', function(code, signal) {
            var lines = o.toString().split('\n').filter(function(a) {
                return a;
            });
            //var lines = o.toString().split('\n').filter(function(a){return a && a.split('/').length>0;});
            console.log(lines);
        }).on('data', function(data) {
            o.push(data);
        }).stderr.on('data', function(data) {
            o.push(data);
        });
    });
}).connect({
    host: Remote.Host,
    port: 22,
    username: 'root',
    privateKey: require('fs').readFileSync(process.env.KEY || '/root/.ssh/id_rsa')
});
/*

conn = {
        username: 'root',
        pem: sshPrivateKey
    },
    keepAlive = {
        keepAlive: false
    },
    session = nodemiral.session(process.env.HOSTNAME || 'localhost', conn, keepAlive);
var Remote = {
    Host: beta,
    Port: 41223,
};
var Snapshot = 'tank/Rick@Rick';

var child = require('child_process');


zfs.stdout.pipe(process.stdout, {
    end: false
});

var zfs = child.spawn('zfs send ' + Snapshot + ' | mbuffer  -s 128k -m 1G -O ' + Remote.Host + ':' + Remote.Port);
process.stdin.resume();

process.stdin.pipe(myREPL.stdin, {
    end: false
});

myREPL.stdin.on('end', function() {
    process.stdout.write('REPL stream ended.');
});

myREPL.on('exit', function(code) {
    process.exit(code);
});


session.execute('uname -a', function(err, code, logs) {
    console.log(c.green(logs.stdout));

});
*/
