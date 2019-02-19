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


router.all("*", function(req, res, next){
	res.locals.query = req.query;
	next();
});

router.post("/resettlement-planning/:personId/*", function(req, res, next){
	res.locals.person = cases.filter(person => person.index == req.params.personId)[0];
	next();
});

router.get("/resettlement-planning/:personId/*", function(req, res, next){
	res.locals.person = cases.filter(person => person.index == req.params.personId)[0];
	next();
});

router.get("/resettlement-planning", function(req, res, next){
	res.locals.caseList = cases;
	next();
});

//gp routes

router.get("/resettlement-planning/:personId/gp", function(req, res, next){
	let person = cases.filter(person => person.index == req.params.personId)[0];
	if(person.gpid){
		res.locals.surgery = require("../app/data/doctors.js")
							.filter(doctor => doctor.id = person.gpid)[0];
		res.redirect(`/resettlement-planning/${req.params.personId}/gp-form-print`);
	} else {
		res.locals.surgeries = require("../app/data/doctors.js");
		next();
	}
})

router.get("/probation/gp", function(req, res, next){
	
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

router.post("/resettlement-planning/:personId/gp-form-print", function(req, res, next){
	let person = cases.filter(person => person.index == req.params.personId)[0];

	person.gpid = req.body.gpid;

	next();
});

router.get("/resettlement-planning/:personId/gp-form-print", function(req, res, next){
	res.locals.surgery = require("../app/data/doctors.js").filter(surgery => surgery.id === res.locals.person.gpid)[0];
	next();
})


//housing

router.post("/resettlement-planning/:personId/housing", function(req, res, next){

	if(req.body.resetHousing){
		delete res.locals.person.releaseLocation;
		res.locals.person.hasAddress = false;
	} 
	next();
})

router.post("/resettlement-planning/:personId/housing-2", function(req, res, next){
	res.locals.person.addressProvided = req.body["address-provided"];
	next()
});


router.post("/resettlement-planning/:personId/housing-3", function(req, res, next){
	res.locals.person.releaseLocation = req.body["release-location"];
	res.redirect(`/resettlement-planning/${req.params.personId}/housing`)
});



router.post("/resettlement-planning/:personId/housing-post", function(req, res, next){
	let person = cases.filter(person => person.index == req.params.personId)[0];
	
	person.hasAddress = true;

	person.address.street = req.body["address-street"];
	person.address.city = req.body["address-town"];
	person.address.postcode = req.body["address-postcode"];

	console.log(person)

	res.redirect(`/resettlement-planning/${req.params.personId}/details`)
});


//email routes

router.post("/resettlement-planning/:personId/email-2", function(req, res, next){

	res.locals.person.hasEmail = req.body["has-email"] === "yes";
	res.locals.person.emailProvider = req.body["email-provider"];
	res.locals.person.email = req.body["email"];
	res.locals.person.emailPassword = req.body["password"];
	res.locals.person.hasBank = req.body["has-bank"];

	if(req.body["has-email"] == "yes"){
		res.redirect(`/resettlement-planning/${req.params.personId}/details`)
	}

	next();
});

//employment routes

router.post("/resettlement-planning/:personId/work", function(req, res, next){
	res.locals.person.hasWork = req.body["has-work"];

	if(req.body["has-work"] == "yes"){
		res.redirect(`/resettlement-planning/${req.params.personId}/details`)
	}
	next();
});

//banking routes

router.post("/resettlement-planning/:personId/bank", function(req, res, next){
	res.locals.person.hasBank = req.body["has-bank"];

	if(req.body["has-bank"] == "yes"){
		res.redirect(`/resettlement-planning/${req.params.personId}/details`)
	}
	next();
});


//ID routes

router.post("/resettlement-planning/:personId/proof-of-id", function(req, res, next){
	res.locals.person.hasId = req.body["has-id"];

	if(req.body["has-id"] == "yes"){
		res.redirect(`/resettlement-planning/${req.params.personId}/details`)
	}
	next();
});


//genetal route functions
router.get("/resettlement-planning/:personId/:pageName", function(req, res, next){
	res.render("resettlement-planning/" + req.params.pageName);
});



module.exports = router;
