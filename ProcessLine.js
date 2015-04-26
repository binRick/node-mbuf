#!/usr/bin/env node

var c = require('chalk'),
    async = require('async'),
    Parallel = 1;

process.stdin.pipe(require('split')()).on('data', processLine);

var q = async.queue(function(task, callback) {
    console.log(c.yellow.bgWhite('hello ' + task.line));
    


    callback();
}, Parallel);

q.drain = function() {
    console.log(c.green.bgWhite('all items have been processed'));
}
function processLine(line) {
    if (String(line).length < 1) return;
    q.push({
        line: line
    }, function(err) {
        console.log(c.black.bgWhite('finished processing ', line));
    });
}
