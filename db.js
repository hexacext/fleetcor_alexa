'use strict';

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

var mongodb = {
	checkIfCardExists: function(userId, lastFour){
		return new Promise(function(resolve, reject){
			MongoClient.connect(process.env.MONGODB_URL + process.env.MONGODB_NAME, function(err, db) {
				console.log("Inside db");
				if (err) { 
					console.log("Error in getting connection ", err);
					return reject(err);
				} else {	  
					db.collection("fleetcor_user_card").find({$and: [{"userId": userId, "lastFour": lastFour, "status": "active"}]}).toArray((error, result) => {
						if(error){
							console.log(error);
							return reject(error);
						} else {
							if(result.length > 0){
								return resolve(true);
							} else {
								return resolve(false);
							}
						}
						db.close();
					});
				}
			});
		});
	},
	blockCard: function(userId, lastFour){
		return new Promise(function(resolve, reject){
			MongoClient.connect(process.env.MONGODB_URL + process.env.MONGODB_NAME, function(err, db) {
				console.log("Inside db");
				if (err) { 
					console.log("Error in getting connection ", err);
					return reject(err);
				} else {	  
					db.collection("fleetcor_user_card").updateOne({$and: [{"lastFour": lastFour},{"userId": userId}]},{$set: {"status": "inactive"}}, 
					function(error, result){
						if(error){
							console.log("Error in blockCard ", error);
							return reject(error);
						} else {
							console.log("Updated ", result.result.nModified);
							return resolve(true);
						}
					});
				}
			});
		});
	},
	getBalance: function(userId, lastFour){
		return new Promise(function(resolve, reject){
			MongoClient.connect(process.env.MONGODB_URL + process.env.MONGODB_NAME, function(err, db) {
				console.log("Inside db");
				if (err) { 
					console.log("Error in getting connection ", err);
					return reject(err);
				} else {	  
					db.collection("fleetcor_user_card").find({$and: [{"userId": userId, "lastFour": lastFour, "status": "active"}]}).toArray((error, result) => {
						if(error){
							console.log(error);
							return reject(error);
						} else {
							if(result.length > 0){
								console.log(result[0].balance);
								return resolve(result[0].balance);
							} else {
								return resolve(0);
							}
						}
						db.close();
					});
				}
			});
		});
	}
};

module.exports = mongodb;

/*MongoClient.connect(process.env.MONGODB_URL + process.env.MONGODB_NAME, function(err, db) {
	if (err) { 
		console.log("Error in getting connection ", err);
	} else {	  
		db.collection("fleetcor_user_card").find({"lastFour": "1234"}).toArray((error, result) => {
			if(error){
				console.log(error);
			} else {
				console.log(result);
			}
			db.close();
		});
	}
});*/