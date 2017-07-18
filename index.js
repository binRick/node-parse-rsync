#!/usr/bin/env node

var c = require('chalk'),
    bytes = require('bytes'),
    child = require('child_process'),
    Rsync = '/usr/local/rsync/bin/rsync --numeric-ids --info=progress2 -ar ',
    src = process.argv[2],
    dst = process.argv[3];

var cmd = Rsync + src + ' ' + dst,
    cmdA = cmd.split(' ');
console.log('syncing', src, 'to', dst, 'with command:\n', cmd);


var rs = child.spawn(cmdA[0], cmdA.slice(1, cmdA.length));
rs.on('exit', function(code) {
    console.log('rsync finished with code', code);
});
rs.stdout.on('data', function(data) {
    var o = data.toString().split('\n');
    o = o[o.length - 1].split(')')[0].replace(/\s+/g, ' ').split(' ').filter(function(s) {
        return s;
    });
    if (o.length != 6) return;
    var oO = {
        completedBytes: o[0].replace(/,/g, ''),
        completedPercentage: o[1].replace(/%/, ''),
        speed_bps: parseInt(bytes.parse(o[2].split('B')[0].toLowerCase() + 'b')),
        elapsedTime: o[3],
        filesTransferred: o[4].split('#')[1],
        scanState: o[5].split('ir').length > 1 ? 'scanning' : 'scanned',
        filesToCopy: o[5].split('=')[1].split('/')[0],
        totalFiles: o[5].split('=')[1].split('/')[1],
    };
    console.log(o);
    console.log(oO);
});
rs.stderr.on('data', function(data) {
    console.log('stderr data: ', data.toString());
    process.exit(-1);
});
