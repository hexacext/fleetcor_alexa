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
					db.collection("fleetcor_user_card").updateOne({$and: [{"lastFour": lastFour},{"userId": userId},{"status": "active"}]},{$set: {"status": "inactive"}}, 
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
	},
	getCreditLimit: function(userId, lastFour){
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
								console.log(result[0].creditLimit);
								return resolve(result[0].creditLimit);
							} else {
								return resolve(0);
							}
						}
						db.close();
					});
				}
			});
		});
	},
	getTransactions: function(userId, lastFour){
		return new Promise(function(resolve, reject){
			MongoClient.connect(process.env.MONGODB_URL + process.env.MONGODB_NAME, function(err, db) {
				console.log("Inside db");
				if (err) { 
					console.log("Error in getting connection ", err);
					return reject(err);
				} else {	  
					//Fetch only the recent 6 transactions
					db.collection("fleetcor_user_transaction").find({$and: [{"userId": userId, "lastFour": lastFour}]}).sort({"transactionDate": -1}).limit(6).toArray((error, result) => {
						if(error){
							console.log(error);
							return reject(error);
						} else {
							//console.log(result);
							return resolve(result);
						}
						db.close();
					});
				}
			});
		});
	}
};

module.exports = mongodb;