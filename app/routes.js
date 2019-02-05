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

router.get("/prisoner/gp", function(req, res, next){
	
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

router.get("/resettlement-planning/:personId/housing", function(req, res, next){
	console.log(res.locals.person)
	let location = res.locals.person.releaseLocation;
	if(location){
		let url = `https://services.shelter.org.uk/api/v1/location/${location}?api_token=inoVa1mNLOG1SKKMThHBJ5ZZYGtx6Zupy2EO2dmW`;
		request(url, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			    var data = JSON.parse(body);
			    res.locals.shelter = data.data.agencies.data[0];
			    console.log(res.locals.shelter);
				res.render("resettlement-planning/housing");
				
		  }
		})
	} else {
		next();
	}
})


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
	if(req.body["has-email"] = "yes") {
		res.locals.person.email = req.body["email"];
	} else {

	}

	next();
});


//genetal route functions
router.get("/resettlement-planning/:personId/:pageName", function(req, res, next){
	res.render("resettlement-planning/" + req.params.pageName);
});



module.exports = router;
