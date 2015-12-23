#! /usr/bin/env node

'use strict';
var restify = require('restify');
var bunyan = require('bunyan');
var routes = require('./routes');
var cfgManager = require('node-config-manager');

var options = {
  configDir   : './config',
  env         : process.env.NODE_ENV || 'development',
  camelCase   : true
};

cfgManager.init(options);
cfgManager.addConfig('logger');

var loggerCfg = cfgManager.getConfig('logger');

var log = bunyan.createLogger({
  name        :   'inventory-integration-service',
  level       :   loggerCfg.logLevel,
  path        :   loggerCfg.path,
  serializers :   bunyan.stdSerializers
});

var server = restify.createServer({
  name    : 'inventory-integration-service',
  log     :  log
});

server.use(restify.bodyParser({mapParams : false}));
server.use(restify.queryParser());
server.pre(restify.pre.sanitizePath());


//server.on('after', restify.auditLogger({ log: log }));
server.on('after', function(req, res, route, err) {
  if (route && (route.spec.path === '_health')) {
    //Skip auditor logging if its health request
    return;
  }
  var auditer = restify.auditLogger({log:log});
  auditer(req, res, route, err);
});

routes(server);

server.on('uncaughtException', function(req, res, route, err) {
  var auditer = restify.auditLogger({log:log});
  auditer(req, res, route, err);
  res.send(500, "Unexpected error occured :" + err);
});

console.log('Server started.');
server.listen(3002, function () {
  log.info('%s listening at %s', server.name, server.url);
});
