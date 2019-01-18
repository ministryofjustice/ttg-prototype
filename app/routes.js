const express = require('express');
const router = express.Router();
const request = require('request');

//request.debug = true

// Add your routes here - above the module.exports line

let cases;

request('https://my.api.mockaroo.com/prisoners.json?key=4f785100', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    cases = JSON.parse(body);
  }
})


router.get("*", function(req, res, next){
	res.locals.query = req.query;
	next();

});

router.get("/resettlement-planning", function(req, res, next){
	res.locals.caseList = cases;
	next();

});

router.get("/resettlement-planning/:personId/*", function(req, res, next){
	res.locals.person = cases.filter(person => person.index == req.params.personId)[0];
	next();
});

router.get("/resettlement-planning/:personId/gp", function(req, res, next){
	res.locals.surgeries = require("../app/data/doctors.js");
	next();
})



router.post("/resettlement-planning/:personId/register-gp/:gpid", function(req, res, next){

	let person = cases.filter(person => person.index == req.params.personId)[0];
	
	person.previousName = req.body["previous-name"];
	person.nhsNumber = req.body["nhs-number"];
	person.phone = req.body["phone"];

	next();
});

router.get("/resettlement-planning/:personId/register-gp/:gpid/edit-gp", function(req, res, next){
	res.locals.surgery = require("../app/data/doctors.js").filter(surgery => surgery.id === req.params.gpid)[0];

	res.render("resettlement-planning/edit-gp");
});

router.get("/resettlement-planning/:personId/register-gp/:gpid", function(req, res, next){
	res.locals.surgery = require("../app/data/doctors.js").filter(surgery => surgery.id === req.params.gpid)[0];

	res.render("resettlement-planning/register-gp");
});



router.post("/resettlement-planning/:personId/housing-3", function(req, res, next){
	let location = req.body['release-location'];
	let url = `https://services.shelter.org.uk/api/v1/location/${location}?api_token=inoVa1mNLOG1SKKMThHBJ5ZZYGtx6Zupy2EO2dmW`;
	request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    var data = JSON.parse(body);
		    res.locals.shelter = data.data.agencies.data[0];
		    console.log(res.locals.shelter);
			res.render("resettlement-planning/housing-3");
	  }
	})
});


router.get("/resettlement-planning/:personId/:pageName", function(req, res, next){
	res.render("resettlement-planning/" + req.params.pageName);
});

router.post("/resettlement-planning/:personId/gp-form-print", function(req, res, next){
	let person = cases.filter(person => person.index == req.params.personId)[0];
	
	person.formPrinted = true;	

	res.redirect(`/resettlement-planning/${req.params.personId}/register-gp`)
});





router.post("/resettlement-planning/:personId/housing-post", function(req, res, next){
	let person = cases.filter(person => person.index == req.params.personId)[0];
	
	person.hasAddress = true;

	person.address.street = req.body["address-street"];
	person.address.town = req.body["address-town"];
	person.address.postcode = req.body["address-postcode"];

	res.redirect(`/resettlement-planning/${req.params.personId}/details`)
});






module.exports = router;
