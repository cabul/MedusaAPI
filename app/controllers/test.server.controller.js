'use strict';

exports.showtest = function (req, res) {
	res.render("test", getParams());
};

var getParams = function (){
	return {
		datito: "hi",
		board: makeBoard
	};
};

var makeBoard = function (){
	return [[0,0,0],[0,0,0],[0,0,0]];
};