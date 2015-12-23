var controller = require('./../controllers/inventory-integration-controller');
var restify = require('restify');

module.exports = function(server){
                     server.post('/api/inventoryEnquiry/post',controller.inventoryEnquiry);

             };
