const axios = require("axios");
const {
	validationResult,
	body,
	check
} = require("express-validator");
const {
	sanitizeBody
} = require("express-validator");
const async = require("async");
const reflectAll = require("async/reflectAll");
const _ = require('lodash');
const myResponse = require('./myResponse');
const queryHelper = require('./sfHelpers/queryHelper');
const crudHelper = require('./sfHelpers/crudHelper');
const fileController = require('./fileController');
const {
	salesforceException,
	externalCalloutException,
	inputValidationException
} = require('./customeException');
const contactEv = require('./contactEvidenceController');
const logger = require('./customeLogger');

exports.getCompanies = [
	// Validate fields
	check("personalNumber")
	.isNumeric()
	.isLength({
		min: 12,
		max: 12
	})
	.withMessage("Personal number is invalid")
	.matches(/^(19|20)?[0-9]{2}(0|1)[0-9][0-3][0-9][-]?[0-9]{4}$/)
	.withMessage("Personal number is in invalid format"),
	//Sanitize fields
	sanitizeBody("personalNumber")
	.trim()
	.escape(),
	(req, res, next) => {
		let resBody = null;

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			//There are errors. send error result
			resBody = {
				success: false,
				code: "INVALID_PERSONALNUMBER",
				errors: errors.array()
			};
			res.status(422).json(resBody);
			res.body = resBody;
			return next();
		} else {
			var token = req.access_token;
			var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";
			var config = {
				url: "/se/company/engagement/2.0/" + req.query.personalNumber,
				baseURL: apiRoot,
				method: "get",
				headers: {
					Authorization: "Bearer " + token
				}
			};
			console.log(config);
			axios(config)
				.then(function (response) {
					if (
						response &&
						response.data &&
						response.data.engagements &&
						response.data.engagements.length > 0
					) {
						var output = response.data.engagements.filter(function (x) {
							return x.statusCode == 100;
						});
						res.status(200).send(output);
						res.body = output;
					} else {
						res.status(200).send([]);
						res.body = [];
					}

					return next();
				})
				.catch(function (error) {
					if (error.response) {
						// The request was made and the server responded with a status code
						// that falls out of the range of 2xx
						res.status(error.response.status).send(error.response.data);
						res.body = error.response.data;
					} else if (error.request) {
						// The request was made but no response was received
						// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
						// http.ClientRequest in node.js
						resBody = "No response from Roaring server";
						res.status(204).send(resBody);
						res.body = resBody;
					} else {
						// Something happened in setting up the request that triggered an Error
						console.log("Error", error.message);
						resBody = {
							error: "Error in loading companioes"
						};
						res.status(500).send(resBody);
						res.body = resBody;
					}
					// res
					//   .status(400)
					//   .send({ error: "Error in loading companioes from roaring" });
					return next();
				});
		}
	}
];

function callRoaring(
	callback,
	url,
	method,
	data,
	invalid_response_error,
	apicall_error,
	token
) {
	var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";
	var config = {
		url: url,
		baseURL: apiRoot,
		method: method,
		headers: {
			Authorization: "Bearer " + token
		},
		params: data
	};
	if (method == "get") config.query;
	else config.data = data;
	//console.log(config);
	axios(config)
		.then(function (response) {
			if (response && response.data) {
				var output = response.data;
				callback(undefined, output);
			} else callback({
				error: error,
				code: invalid_response_error
			}, undefined);
		})
		.catch(function (error) {
			callback({
					error: JSON.stringify(error),
					code: apicall_error
				},
				undefined
			);
		});
}

exports.submit = [
	// Validate fields
	body("personalNumber", "Personal number is required")
	.not()
	.isEmpty()
	.withMessage("Personalnumber is required")
	.isNumeric()
	.isLength({
		min: 12,
		max: 12
	})
	.withMessage("Personal number is invalid")
	.matches(/^(19|20)?[0-9]{2}(0|1)[0-9][0-3][0-9][-]?[0-9]{4}$/)
	.withMessage("Personal number is in invalid format"),
	body("orgNumber", "Organization number is required")
	.isNumeric()
	.not()
	.isEmpty()
	.isLength({
		min: 9,
		max: 10
	})
	.withMessage("Organization number is invalid"),
	body("orgName", "Organization name is required")
	.isString()
	.isLength({
		min: 1
	})
	.withMessage("Invalid organization name"),
	body("amount", "amount is required")
	.not()
	.isEmpty()
	.isNumeric()
	.isDecimal()
	.withMessage("Invalid amount"),
	body("amourtizationPeriod", "amourtizationPeriod is required")
	.not()
	.isEmpty()
	.isNumeric()
	.isInt()
	.withMessage("Invalid amourtizationPeriod"),
	body("phoneNumber", "PhoneNumber is required")
	.not()
	.isEmpty()
	.isString()
	.isLength({
		min: 9
	})
	.withMessage("Invalid phone number"),
	body("bankid", "BankID detail is required")
	.not()
	.isEmpty()
	.withMessage("BankID detail is required"),
	body("bankid.userInfo", "BankID userInfo is required")
	.not()
	.isEmpty()
	.withMessage("BankID userInfo is required"),
	body("bankid.ocspResponse", "BankID ocspResponse is required")
	.not()
	.isEmpty()
	.withMessage("BankID ocspResponse is required"),
	//Sanitize fields
	sanitizeBody("personalNumber")
	.trim()
	.escape(),
	sanitizeBody("orgNumber")
	.trim()
	.escape(),
	sanitizeBody("phoneNumber")
	.trim()
	.escape(),
	sanitizeBody("orgName")
	.trim()
	.escape(),
	(req, res, next) => {
		let resBody = null;

		console.log(req.url);
		console.log(JSON.stringify(req.body));

		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			//There are errors. send error result
			resBody = {
				success: false,
				code: "INVALID_REQUEST",
				errors: errors.array()
			};
			res.status(422).json(resBody);
			res.body = resBody;
			return next();
		} else {
			var token = req.roaring_access_token;
			var tasks = {
				overview: function (callback) {
					callRoaring(
						callback,
						"/se/company/overview/1.1/" + req.body.orgNumber,
						"get",
						undefined,
						"COMPANY_OVERVIEW_INVALID_RESPONSE",
						"COMPANY_OVERVIEW_API_ERROR",
						token
					);
				},
				ecoOverview: function (callback) {
					callRoaring(
						callback,
						"/se/company/economy-overview/1.1/" + req.body.orgNumber,
						"get",
						undefined,
						"COMPANY_ECOOVERVIEW_INVALID_RESPONSE",
						"COMPANY_ECOOVERVIEW_API_ERROR",
						token
					);
				},
				boardMembers: function (callback) {
					callRoaring(
						callback,
						"/se/company/board-members/1.1/" + req.body.orgNumber,
						"get",
						undefined,
						"COMPANY_BOARDMEMBERS_INVALID_RESPONSE",
						"COMPANY_BOARDMEMBERS_API_ERROR",
						token
					);
				},
				beneficialOwners: function (callback) {
					callRoaring(
						callback,
						"/se/beneficialowner/1.0/company/" + req.body.orgNumber,
						"get",
						undefined,
						"COMPANY_BENEFICIAL_INVALID_RESPONSE",
						"COMPANY_BENEFICIAL_API_ERROR",
						token
					);
				},
				signatory: function (callback) {
					callRoaring(
						callback,
						"/se/company/signatory/1.1/" + req.body.orgNumber,
						"get",
						undefined,
						"COMPANY_SIGNATORY_INVALID_RESPONSE",
						"COMPANY_SIGNATORY_API_ERROR",
						token
					);
				},
				cmpSanctionInfo: function (callback) {
					callRoaring(
						callback,
						"/global/sanctions-lists/1.0/search",
						"get", {
							name: req.body.orgName
						},
						"COMPANY_SANCTION_INVALID_RESPONSE",
						"COMPANY_SANCTION_API_ERROR",
						token
					);
				},
				perSanctionInfo: function (callback) {
					callRoaring(
						callback,
						"/global/sanctions-lists/1.0/search",
						"get", {
							name: req.body.bankid.userInfo.name
						},
						"PERSON_SACNTION_INVALID_RESPONSE",
						"PERSON_SACNTION_API_ERROR",
						token
					);
				},
				pepInfo: function (callback) {
					callRoaring(
						callback,
						"/nordic/pep/1.0/search",
						"get", {
							personalNumber: req.body.personalNumber,
							countryCode: "se"
						},
						"PEP_INVALID_RESPONSE",
						"PEP_API_ERROR",
						token
					);
				}
			};
			var roaring;
			async.parallel(async.reflectAll(tasks),
				function (errors, results) {
					console.log(JSON.stringify(results));
					if (!results ||
						(results && _.size(results) == 0) ||
						!results.hasOwnProperty('overview') ||
						(results.hasOwnProperty('overview') && !results.overview.hasOwnProperty('value'))) {

						resBody = myResponse(false, null, 400, "Some Problems in Roaring API.", errors);
						console.log(resBody);
						res.status(400).send(resBody);
						res.body = resBody;
						return next();
					} else {
						for (var attr in results) req.body[attr] = results[attr].value;
						token = req.sf_access_token;
						var apiRoot =
							process.env.SALESFORCE_API_ROOT || "https://cs85.salesforce.com"; // for prod set to https://api.zignsec.com/v2
						var config = {
							url: "/services/apexrest/submitWithoutCallout",
							baseURL: apiRoot,
							method: "post",
							data: req.body,
							headers: {
								Authorization: "Bearer " + token
							}
						};
						console.log("Sending submit to salesforce : " + config);
						axios(config)
							.then(function (response) {
								console.log(JSON.stringify(response.data));
								res.status(200).send(response.data);
								res.body = response.data;
								return next();
							})
							.catch(function (error) {
								if (error.response) {
									// The request was made and the server responded with a status code
									// that falls out of the range of 2xx
									console.log(error.response.data);
									console.log(error.response.status);
									console.log(error.response.headers);

									res.status(error.response.status).send(error.response.data);
									res.body = error.response.data;
								} else if (error.request) {
									// The request was made but no response was received
									// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
									// http.ClientRequest in node.js
									console.log(error.request);
									let msg = "No response from BankID server";
									res.status(500).send(msg);
									res.body = msg; // For logging purpose
								} else {
									// Something happened in setting up the request that triggered an Error
									console.log("Error", error.message);
									res.status(500).send(error.message);
									res.body = error.message; // For logging purpose
								}
								console.log(error.config);
								console.log(error.toJSON());
								// return Promise.reject(error.response);
								return next();
							});
					}
				});
		}
	}
];

exports.getNeedsList = function (req, res, next) {
	var accessToken = req.access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT ||
		"https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/getNeedsFields",
		baseURL: apiRoot,
		method: "get",
		params: req.query,
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(config);
	axios(config)
		.then(function (response) {
			res.send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			let resBody = null;
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				resBody = "No response from BankID server";
				res.status(204).send(resBody);
				res.body = resBody;
			} else {
				// Something happened in setting up the request that triggered an Error        
				console.log("Error", error.message);

				resBody = {
					error: "Error in loading needs list from salesforce"
				};
				res.status(500).send(resBody);
				res.body = resBody;
			}
			// res
			//   .status(400)
			//   .send({ error: "Error in loading needs list from salesforce" });
			return next();
		});
};

exports.myrequests = function (req, res, next) {
	var accessToken = req.access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT ||
		"https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/getCustomerApp",
		baseURL: apiRoot,
		method: "get",
		params: req.query,
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(config);
	axios(config)
		.then(function (response) {
			res.status(200).send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			let resBody = null;
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				resBody = "No response from BankID server";
				res.status(204).send(resBody);
				res.body = resBody;
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log("Error", error.message);
				resBody = {
					error: "Error in loading needs list from salesforce"
				};
				res.status(500).send(resBody);
				res.body = resBody;
			}
			// res
			//   .status(400)
			//   .send({ error: "Error in loading needs list from salesforce" });

			return next();
		});
};

exports.acceptOffer = function (req, res, next) {
	var accessToken = req.access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT ||
		"https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/acceptOffer",
		baseURL: apiRoot,
		method: "put",
		params: req.query,
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(config);
	axios(config)
		.then(function (response) {
			res.status(200).send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			let resBody = null;
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				resBody = "No response from BankID server";
				res.status(204).send(resBody);
				res.body = resBody;
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log("Error", error.message);
				resBody = {
					error: "Error in loading needs list from salesforce"
				};
				res.status(500).send(resBody);
				res.body = resBody;
			}
			// res
			//   .status(400)
			//   .send({ error: "Error in loading needs list from salesforce" });
			return next();
		});
};

exports.getOffers = function (req, res, next) {
	var accessToken = req.access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT ||
		"https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/offersPerOpp",
		baseURL: apiRoot,
		method: "get",
		params: req.params,
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(config);
	axios(config)
		.then(function (response) {
			res.status(200).send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			let resBody = null;
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				resBody = "No response from BankID server";
				res.status(204).send(resBody);
				res.body = resBody;
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log("Error", error.message);
				resBody = {
					error: "Error in loading needs list from salesforce"
				};
				res.status(500).send(resBody);
				res.body = resBody;
			}
			// res
			//   .status(400)
			//   .send({ error: "Error in loading needs list from salesforce" });
			return next();
		});
};
exports.rejectOffer = function (req, res, next) {
	var accessToken = req.access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT ||
		"https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/rejectOffer",
		baseURL: apiRoot,
		method: "put",
		params: req.query,
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(config);
	axios(config)
		.then(function (response) {
			res.status(200).send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			let resBody = null;
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				resBody = "No response from BankID server";
				res.status(204).send(resBody);
				res.body = resBody;
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log("Error", error.message);
				resBody = {
					error: "Error in loading needs list from salesforce"
				};
				res.status(500).send(resBody);
				res.body = resBody;
			}
			// res
			//   .status(400)
			//   .send({ error: "Error in loading needs list from salesforce" });
			return next();
		});
};

exports.cancel = function (req, res, next) {
	var accessToken = req.access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT ||
		"https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/cancelApplication",
		baseURL: apiRoot,
		method: "put",
		params: req.params,
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(config);
	axios(config)
		.then(function (response) {
			res.status(200).send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			let resBody = null;
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				resBody = "No response from BankID server";
				res.status(204).send(resBody);
				res.body = resBody;
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log("Error", error.message);
				resBody = {
					error: "Error in loading needs list from salesforce"
				};
				res.status(500).send(resBody);
				res.body = resBody;
			}
			// res
			//   .status(400)
			//   .send({ error: "Error in loading needs list from salesforce" });
			return next();
		});
};


async function saveApplication(sfConn, payload, toBeAttachedFiledIds) {
	let witoutCompany_NeedValue = 'purchase_of_business';
	let accountInfo = payload.account,
		contactInfo = payload.contact,
		oppInfo = payload.opp,
		bankid = payload.bankid;

	// sync contactInfo with bankid data, if bankid data exist
	if (bankid) {
		contactInfo.lastName = bankid.userInfo.surname;
		contactInfo.firstName = bankid.userInfo.givenName;
		contactInfo.Veri_cationMethod__c = 'BankID'
		contactInfo.VerificationEvidence__c = bankid.signature;
		contactInfo.Last_Contact_Veri_ed_Date__c = Date.now();
	}

	let dettachedFiles;

	let oppId = (oppInfo.Id) ? oppInfo.Id : null,
		opp,
		account,
		contact,
		accId,
		contactId,
		accUpsertResult,
		contactUpsertResult,
		oppUpsertResult;

	// Get Opp, if oppId exist
	if (oppId) {
		opp = await crudHelper.readSobjectInSf(sfConn, 'Opportunity', oppId);
		// accId = opp.AccountId;
		contactId = opp.PrimaryContact__c;

		delete oppInfo.recordTypeId;
	} else {

		if (!accountInfo.Organization_Number__c) {
			if (String(oppInfo.Need__c).indexOf(witoutCompany_NeedValue) != -1) {
				accId = null;
				accountInfo.Name = 'CMP_' + contactInfo.Personal_Identity_Number__c;
			} else {
				throw new salesforceException("'orgNumber' is not provided.", null, 400);
			}
		} else {
			// Get Account with orgNumber
			let getAccWhereCluase = {
				Organization_Number__c: accountInfo.Organization_Number__c
			}
			account = await queryHelper.getSingleQueryResult(sfConn, 'Account', getAccWhereCluase);
			accId = (account != null) ? account.Id : null;
		}

		// Upsert Account
		accUpsertResult = await crudHelper.upsertSobjectInSf(sfConn, 'Account', accountInfo, accId);
		oppInfo['AccountId'] = accUpsertResult.id;

		// Get Contact with personalNum
		let getContactWhereCluase = {
			Personal_Identity_Number__c: contactInfo.Personal_Identity_Number__c
		}
		contact = await queryHelper.getSingleQueryResult(sfConn, 'Contact', getContactWhereCluase);
		contactId = (contact != null) ? contact.Id : null;
		// Upsert Contact
		contactInfo['AccountId'] = accUpsertResult.id;
		contactUpsertResult = await crudHelper.upsertSobjectInSf(sfConn, 'Contact', contactInfo, contactId);

		oppInfo['PrimaryContact__c'] = contactUpsertResult.id;
	}


	// Opportunity Processing
	// Upsert Opportunity
	oppUpsertResult = await crudHelper.upsertSobjectInSf(sfConn, 'Opportunity', oppInfo, oppId);
	
	// Files Handler
	if (oppUpsertResult != null){
		try {
			// files detached
			dettachedFiles = await fileController.detachedAllFilesFromTargetId(oppUpsertResult.id, sfConn);
			// files attached
			if (toBeAttachedFiledIds){
				await fileController.assignFileToTargetRecord(toBeAttachedFiledIds, oppUpsertResult.id, sfConn);
			}
		} catch (err) {
			console.log('Error when detaching and reattaching the files', err);
		}
	}

	// save contact-evidence if bankid data exist
	if (bankid){
		try{
			await contactEv.insertContactEvidences(sfConn, contactId, bankid);
		} catch(err) {
			logger.error('An error raised on `insertContactEvidences`.', {metadata: err});
		}
	}

	if (oppUpsertResult) {
		return oppUpsertResult.id;
	} else {
		return null;
	}
}
exports.saveApplication = saveApplication;


async function getCompanies2(req, res, next) {
	// let url = "/person/1.0/person/personalNumber=" + req.query.personalNumber;
	// var roaring_token = req.access_token;

	// let config = {
	// 	url: url,
	// 	baseURL: process.env.ROARING_API_ROOT || 'https://api.roaring.io',
	// 	method: "get",
	// 	headers: {
	// 		Authorization: "Bearer " + roaring_token
	// 	}
	// };


	// try{
	// 	const response = await axios(config);
	// 	console.log(response);

	// 	res.status(200).body(response);


	// } catch (error) {
	// 	console.log(error);
	// 	return {
	// 		success: false,
	// 		data: error
	// 	}; 
	// }
	// next();
	let response = {
		companies: [{
				"companyId": "5565002465",
				"companyName": "Wilfast Högsbo Aktiebolag",
				"statusCode": 100,
				"statusText": "Aktivt",
				"roles": [{
					"roleCode": 5,
					"roleName": "Ledamot"
				}],
				"town": "GÖTEBORG"
			},
			{
				"companyId": "5569979734",
				"companyName": "CFA International AB",
				"statusCode": 100,
				"statusText": "Aktivt",
				"roles": [{
					"roleCode": 5,
					"roleName": "Ledamot"
				}],
				"town": "LIDINGÖ"
			},
			{
				"companyId": "5569994600",
				"companyName": "KOMMANDITBOLAGET PORSEN 17",
				"statusCode": 100,
				"statusText": "Aktivt",
				"roles": [{
					"roleCode": 5,
					"roleName": "Ledamot"
				}],
				"town": "SJÖMARKEN"
			},
			{
				"companyId": "7696053631",
				"companyName": "Bostadsrättsföreningen Kamelian 4",
				"statusCode": 100,
				"statusText": "Aktivt",
				"roles": [{
					"roleCode": 5,
					"roleName": "Ledamot"
				}],
				"town": "STOCKHOLM"
			},
			{
				"companyId": "7696245120",
				"companyName": "Ek. för. Sydsvenska höglandets biokol",
				"statusCode": 100,
				"statusText": "Aktivt",
				"roles": [{
					"roleCode": 5,
					"roleName": "Ledamot"
				}],
				"town": "HULT"
			},
			{
				"companyId": "9696373076",
				"companyName": "RUMSDALS HÄSTSKJUTSAR O SERVICE HANDELSBOLAG",
				"statusCode": 100,
				"statusText": "Aktivt",
				"roles": [{
					"roleCode": 14,
					"roleName": "Bolagsman"
				}],
				"town": "UTÖ"
			}
		],
		user_info: {
			"dateFrom": "2010-02-02T00:00",
			"dateTo": "9999-12-31T00:00",
			"notificationName": "Efternamn3542, Christina Birgitta",
			"firstName": "Christina Birgitta Ulrika",
			"givenName": 20,
			"middleName": "Thomeaus",
			"surName": "Efternamn3542",
			"gender": "F",
			"birthDate": "1937-01-30T00:00"
		}
	}

	res.status(200).send(response);
}
exports.getCompanies2 = getCompanies2;


async function getUserInfoFromRoaring(personalNumber, roaringToken, callback=null) {
	let url = "/person/1.0/person";

	let config = {
		url: url,
		baseURL: process.env.ROARING_API_ROOT || 'https://api.roaring.io',
		method: "get",
		params: {
			personalNumber: personalNumber
		},
		headers: {
			Authorization: "Bearer " + roaringToken
		}
	};


	try {
		const response = await axios(config);
		if (!callback) {
			return response.data.posts[0].details[0];
		} else {
			return callback(undefined, response.data.posts[0].details[0]);
		}

	} catch (error) {
		console.log('getUserInfo Error', error);
		if(!callback){
			throw new externalCalloutException('Invalid Repsponse When Getting User Info', error.data, error.statusCode);
		} else {
			return callback('Invalid Repsponse When Getting User Info', undefined);
		}
	}
}
exports.getUserInfo = getUserInfoFromRoaring;



async function getCompaniesOfPersonalNumber(personalNumber, roaring_token, callback=null) {
	var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";

	var config = {
		url: "/se/company/engagement/2.0/" + personalNumber,
		baseURL: apiRoot,
		method: "get",
		headers: {
			Authorization: "Bearer " + roaring_token
		}
	};

	try {
		let response = await axios(config);

		if (response && response.data && response.data.engagements && response.data.engagements.length > 0) {
			var output = response.data.engagements.filter(function (x) {
				return x.statusCode == 100;
			});

			if (!callback) {
				return output;
			} else {
				return callback(undefined, output);
			}
		} else {
			if (!callback) {
				return [];
			} else {
				return callback(undefined, []);
			}
		}
	} catch (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			if(!callback){
				throw new externalCalloutException("Unsuccessful response", error.response.data, error.response.status);
			} else {
				return callback('Unsuccessful response', undefined);
			}
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			if(!callback){
				throw new externalCalloutException("No response from Roaring server", null, 204);
			} else {
				return callback('No response from Roaring server', undefined);
			}
		} else {
			// Something happened in setting up the request that triggered an Error
			console.log("Error", error.message);
			if(!callback){
				throw new externalCalloutException("Error in loading companioes", null, 500);
			} else {
				return callback('Error in loading companioes', undefined);
			}
		}
	}
}
exports.getCompaniesOfPersonalNumber = getCompaniesOfPersonalNumber;