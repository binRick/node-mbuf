var nodemiral = require('nodemiral'),
    pj = require('prettyjson'),
    child = require('child_process'),
    c = require('chalk'),
    fs = require('fs'),
    sshPrivateKey = fs.readFileSync(process.env.KEY || process.env.HOME + '/.ssh/id_rsa', 'utf8'),
    Client = require('ssh2').Client,
    conn = new Client();
var Setup = {
    Local: {
        Name: 'enterprise',
        Host: '66.35.89.50',
        Filesystem: 'tank/Rick',
        Snapshot: 'Rick',
    },
};
Setup.Remote = {
    Host: 'beta',
    bufferPort: 22322,
    Port: 22,
    Pool: 'tank',
};
Setup.Remote.Filesystem = Setup.Remote.Pool + '/Snapshots/' + Setup.Local.Name + '/' + Setup.Local.Filesystem;
Setup.Local.Cmd = 'zfs send ' + Setup.Local.Filesystem + '@' + Setup.Local.Snapshot + ' | mbuffer  -s 128k -m 1G -O ' + Setup.Remote.Host + ':' + Setup.Remote.bufferPort;
Setup.cb = function(e, lines) {
    if (e) throw e;
    console.log(c.red.bgBlack(lines));
};

Setup.preCommands = [];
Setup.preCommands.push('killall mbuffer');
Setup.preCommands.push('zfs list ' + Setup.Remote.Filesystem + ' 2>/dev/null ||zfs create ' + Setup.Remote.Filesystem);
Setup.preCommands.push('zfs set compression=on ' + Setup.Remote.Filesystem);
Setup.preCommands.push('zfs set dedup=on ' + Setup.Remote.Filesystem);


Setup.Cmd = Setup.preCommands.join(' && ') + '; mbuffer -s 128k -m 1G -I ' + Setup.Remote.bufferPort + ' | zfs receive -vF ' + Setup.Remote.Filesystem;
conn.on('ready', function() {
    var o = [];
    conn.exec(Setup.Cmd, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
            var lines = o.toString().split('\n').filter(function(a) {
                return a;
            });
            Setup.cb(err, lines);
        }).on('data', function(data) {
            console.log(data.toString());
            o.push(data);
        }).stderr.on('data', function(data) {
            console.log(data.toString());
            //            o.push(data);
        });
        console.log(pj.render(Setup));
        console.log(c.green(Setup.Local.Cmd));
        setTimeout(function() {
            console.log(c.green('Starting', c.red.bgWhite(Setup.Local.Cmd)));
            var sender = child.spawn(Setup.Local.Cmd);

            sender.stdout.on('data', function(data) {
                console.log('stdout: ' + data);
            });

            sender.stderr.on('data', function(data) {
                console.log('stderr: ' + data);
            });

            sender.on('close', function(code) {
                console.log('child process exited with code ' + code);
            });
        }, 2000);

    });
}).connect({
    host: Setup.Remote.Host,
    port: Setup.Remote.Port || 22,
    username: 'root',
    privateKey: require('fs').readFileSync(Setup.Key || process.env.KEY || '/root/.ssh/id_rsa')
});