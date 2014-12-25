x = "X";
o = "O";
_s = " ";
board = [[x,_s,o],[_s,_s,_s],[_s,_s,_s]];
statuses = ["Match in Progress: ", "X won!", "O won!", "Draw!", "Dragons!!@!"];
board.status = 0;
intervalMilisecs = 1000;
runningGame = false;
activityLine = 0;
nextAction = 0;
startingPlayer = x;
currentPlayer = startingPlayer;
autoScroll = true;
ticket1 = 0;
ticket2 = 0;
matchId = 0;
myTurn = false;


board.gT = function(){
	var table = document.createElement("table");
	for ( i = 0; i < 3; i++){
		var row = document.createElement("tr");
		for ( j = 0; j < 3; j++){
			var cell = document.createElement("td");
			cell.id = i+""+j;
			cell.onclick = clickThisCell;
			cell.appendChild(document.createTextNode(board[i][j]))
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
	var statusRow = document.createElement("tr");
	var statusCell = document.createElement("td");
	statusCell.appendChild(document.createTextNode(startingPlayer + "'s turn"));
	statusCell.colSpan = "3";
	statusCell.className = "status";
	statusCell.id = "game-info";
	statusRow.appendChild(statusCell);
	table.appendChild(statusRow);
	return table;
};

board.gS = function(){
	return board.status;
}

function colorize (boardView, board){
	for ( i = 0; i < 3; i++){
		var row = boardView.childNodes[i];
		for ( j = 0; j < 3; j++){
			var cell = row.childNodes[j];
			if (board[i][j]===x) cell.className = "XCell";
			else if (board[i][j]===o) cell.className = "OCell";
		}
	}
}

localController = [];
serverController = [];
controller = serverController;
localController.doGameAction = function (action, params){

};


serverController.doGameAction = function (action, params, cb){
	console.log("params: " +params);
	serverController.sendPostRequest("/api/"+action+"/", params, cb);
	return serverController.response;
};

serverController.sendPostRequestr = function (path, params){
	console.log(path);
	var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", path);
	for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
         }
    }   
	document.body.appendChild(form);
	form.submit();
};


serverController.sendPostRequest = function (path, params, cb){
	serverController.ready = false;
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp=new XMLHttpRequest();
	else 
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			if(cb) cb(xmlhttp.responseText);
			else{
				serverController.response = xmlhttp.responseText;
				serverController.ready = true;
			}
		}
	};

	xmlhttp.open("POST",path,true);
	xmlhttp.setRequestHeader("Content-type","application/json");
	xmlhttp.send(params);
};
serverController.updateURL = function (url){
	this.remoteUrl = url;
}
controllers = [localController,serverController];

actions = [
	function(){
	controller.doGameAction("ticket","",function(ticketResponse){
		ticket1=ticketResponse;
 		clientLog("player1 got ticket "+ ticket1);
 	});}
/* 	,
function(){
	controller.doGameAction("ticket","",function(ticketResponse){
		ticket2=ticketResponse;
 		clientLog("player2 got ticket "+ ticket2);
 	});}*/
	,
	function(){
	controller.doGameAction("match","{\"playerId\": "+ticket1+"}", function(matchResponse){
		matchId = matchResponse;
 		clientLog("matchId : "+ matchId);
	});}
	,
	function(){
	controller.doGameAction("wait","{\"matchId\": "+matchId+",\"playerId\": "+ticket1+"}", 
		function(waitResponse){
			console.log(waitResponse);
			myTurn = JSON.parse(waitResponse).next;
			clientLog("it "+(myTurn?"IS":"IS NOT")+" my turn");
	});}
];




function clickThisCell (){
	controller.doGameAction("submit",[this]);
}

function updateController (index) {
	controller = controllers[index];
};

function updateFields (index){
	var urlField = document.getElementById("url-field");
	if(index == "1")
		urlField.style.display = "block";
	else urlField.style.display = "none";
	serverController.updateURL(urlField.value);
};

function clientLog (text) {
	var textArea = document.getElementById("log");
	var newLine = document.createTextNode(activityLine++ + ":\t" + text+"\n");
	textArea.appendChild(newLine);
	autoScroll?textArea.focus():textArea.blur();
	textArea.blur();
}

function refreshStatusBar (gameInfo){
	if(board.gS())	gameInfo.innerHTML = statuses[board.gS()];
	else gameInfo.innerHTML = statuses[board.gS()] + currentPlayer + "'s turn";
}

function play () {
	if(!runningGame) 
	clearInterval(runningGame);
	runningGame = setInterval(waitLoop,intervalMilisecs);
}

function stop () {
	clearInterval(runningGame);
}

function reset (){
	
}

function waitLoop (){
	if(!ticket1) actions[0]();
	else if (!matchId) actions[1]();
	else if (!myTurn) actions[2]();
	refreshStatusBar(document.getElementById("game-info"));
}

function nextActionResponse (){
	actions[nextAction]
	nextAction++;
} 




boardView = document.getElementById("game-board");
control = document.getElementById("control");
boardView.appendChild(board.gT());
updateFields();
colorize(boardView.childNodes[0], board);



document.getElementById("controller-url").onchange = function(){serverController.updateURL(this.value);};
document.getElementById("run-button").onclick = play;
document.getElementById("stop-button").onclick = stop;
var controllerSelect = document.getElementById("controller-select");
controllerSelect.onfocus = function () { autoScroll = false};
controllerSelect.onblur = function () { autoScroll = true};
controllerSelect.onchange = function (){
	updateFields(this.selectedIndex);
	updateController(this.selectedIndex);
};
