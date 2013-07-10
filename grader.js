#!/usr/bin/env node
/*
* Automatically grade files for the presence of specified HTML tags/attributes.
* User commander.js and cheerio. Teaches command line application development
* and basic dom parsing
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys = require('util');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var loadChecks = function(checksfile){
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	return checkHtml(fs.readFileSync(htmlfile), checksfile);
};

var checkUrl = function(url, checksfile) {
	rest.get(url).on('complete', function(data){
		printJson(checkHtml(data, checksfile));
	});
};

var checkHtml = function(html, checksfile) {
	$ = cheerio.load(html);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks){
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var clone = function(fn){
	return fn.bind({});
};

var printJson = function(checkJson){
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
};

if(require.main == module) {
	program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Website URL')
        .parse(process.argv);
	var checkJson = "";
	if(program.url != undefined){
		checkJson = checkUrl(program.url, program.checks);
	}
	else {
		checkJson = checkHtmlFile(program.file, program.checks);
		printJson(checkJson);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
