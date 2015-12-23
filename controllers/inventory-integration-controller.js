'use strict';


var restify           = require('restify');
var configManager     = require('node-config-manager');
var bunyan            = require('bunyan');
var rest              = require('./../services/rest.js');
var utility           = require('./../services/utility.js');
var domain         = require('domain');
var validator         = require('./../services/schema.js')
var revalidator       = require('revalidator');

var loggerConfig      = configManager.getConfig('logger');
var d             = domain.create();


var log               = bunyan.createLogger({
	name          : 'inventory-integration-controller.js',
	level         : loggerConfig.logLevel,
	serializers   : bunyan.stdSerializers
});

var util              = new utility();
var restInstance      = new rest();


var type_param_present = false;
var status_param_present = false;
var inventory_type = [];
var inventory_status = [];

function inventoryEnquiry (req,res, next) {

	// validation of input request

	var validatorOfInput = validateRequest(req,res);

	// if valid request then go further
	if (validatorOfInput.valid == true) {
		// Get default options
		var options = util.getParseOptions();

		// path for parsing request business parameters
		var req_params = req.body.Inventory_Inquiry.business_section;

		// get every parameters  values from request body
		var item_code_list = req_params.item_code_list;
		var summary_unit = req_params.summary_unit;
		var inventory_type_list = req_params.inventory_type_list;
		var inventory_status_list = req_params.inventory_status_list;




		// prepare array for only item code
		var item_code_string = item_code(item_code_list,res);


		// boolean for inventory_type_list and inventory_status_list




		// prepare array for inventory type
		if (inventory_type_list.length > 0) {
			type_param_present = true;
			inventory_type = inventory_type_array(inventory_type_list,res);
		}else{
			inventory_type = [];
			type_param_present = false;
		};

		//prepare array for inventory status
		if (inventory_status_list.length > 0) {
			status_param_present = true;
			inventory_status = inventory_status_array(inventory_status_list,res);
		}else{
			inventory_status = [];
			status_param_present = false;
		};

		// make param to send in required form to domain service
		var params = paramtoDomain(item_code_string,summary_unit,res);

		// hit the domain service for getting response on basis of params
		var options = util.getParseOptions();
		//Define host
		options.host = 'localhost';
		//Define port
		options.port = 3001;
		//Define path
		options.path = '/api/getInventoryEnquiry/post';



		return restInstance.postJSON(options, params, function (status, data) {
			if (data.success == false) {
				res.send(data)
			} else {
				var resp = type_status_filter(data,resp);
				res.send(resp)
			}
		});
	}else{
		log.info(validatorOfInput.errors);
		res.send("error in request body")
	}
};

// function defined for parsing response on basis of request parameter for inventory_type and inventory_status
function type_status_filter(data,resp) {
	var resp =  typeAndStatusFilter(data,type_param_present,status_param_present,inventory_type,inventory_status,resp);
	return resp;
};

// validation function
function validateRequest(req,res){

	var input = req.body;
	var validatorOfInput = revalidator.validate(input, validator.schema);
	return validatorOfInput;
}


// make string of item code list from request body
function item_code(item_code_list,res){

	var item_code_array = [];
	item_code_list.forEach(function (item) {
		item_code_array.push(item.item_code)
	});
	var item_code_string = item_code_array.toString();
	return item_code_string;

}


// make array of inventory type list from request body
function inventory_type_array(inventory_type_list,res){

	var inventory_type = [];

	inventory_type_list.forEach(function (type) {
		inventory_type.push(type.inventory_type)
	});
	return inventory_type;

}



// make array of inventory status list from request body
function inventory_status_array(inventory_status_list,res){

	var inventory_status = [];
	inventory_status_list.forEach(function (status) {
		inventory_status.push(status.inventory_status)
	});
	return inventory_status
}



// make params for required in domain service
function paramtoDomain(item_code_string,summary_unit,res){
	var params = {
		"l2Code": item_code_string,
		"summaryUnit": summary_unit
	};
	return params;
}




// function defined for parsing response on basis of request parameter for inventory_type and inventory_status
function typeAndStatusFilter(data,type_param_present,status_param_present,inventory_type,inventory_status,resp){
	var resp;
	if (type_param_present == true || status_param_present == true){

		var each_res = [];
		var junk =[];

		data.forEach(function(raw) {


			var type = raw.inventory_type;
			var status = raw.inventory_status;

			if (type_param_present == true && status_param_present == true) {
				if(inventory_type.indexOf(type) > -1 && inventory_status.indexOf(status) > -1){
					each_res.push(raw)
				}


			} else if (type_param_present == true) {

				if(inventory_type.indexOf(type) > -1){
					each_res.push(raw)
				}


			} else if (status_param_present == true) {
				if(inventory_status.indexOf(status) > -1){
					each_res.push(raw)
				}


			}else{
				junk.push(raw)
			}
		});
		resp = each_res;

	} else {

		resp = data;
	}

	return resp;
}




module.exports.inventoryEnquiry = inventoryEnquiry;