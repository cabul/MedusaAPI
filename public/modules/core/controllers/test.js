x = "X";
o = "O";
board = [[1,2,3],[4,5,6],[7,8,9]];
statuses = ["Not yet started", "Match in Progress: ", "X won!", "O won!", "Draw!", "Dragons!!@!"];
board.status = 0;
intervalMilisecs = 1000;
autoScroll = true;
runningGame = false;
activityLine = 0;
localPlayer = x;
remotePlayer = o;
currentPlayer = x;
ticketId = 0;
matchId = 0;
myTurn = false;


board.gT = function(){
	var table = document.createElement("table");
	for (var i = 0; i < 3; i++){
		var row = document.createElement("tr");
		for (var j = 0; j < 3; j++){
			var cell = document.createElement("td");
			cell.id = i+""+j;
			cell.onclick = clickThisCell;
			if(board[i][j] === o || board[i][j] === x) cell.appendChild(document.createTextNode(board[i][j]));
			else cell.appendChild(document.createTextNode(""));
			row.appendChild(cell);
		}
		table.appendChild(row);
	}
	var statusRow = document.createElement("tr");
	var statusCell = document.createElement("td");
	statusCell.appendChild(document.createTextNode("Game not yet started"));
	statusCell.colSpan = "3";
	statusCell.className = "status";
	statusCell.id = "game-info";
	statusRow.appendChild(statusCell);
	table.appendChild(statusRow);
	table.id = "board";
	return table;
};

board.gS = function(){
	return board.status;
};
board.started = function(){
	return !!board.status;
};
board.updateStatus = function(){
	var draw = true;
	if (board[0][0] === board[1][1] && 
			board[0][0] === board[2][2]) return board.victory(board[1][1]);//main diagonal
	else if ( board[2][0] === board[1][1] &&
						board[2][0] === board[0][2]) return board.victory(board[1][1]); //reverse diagonal
	else for (var i = 0; i < 3; i++){
		if( board[i][0] === board[i][1] &&
				board[i][1] === board[i][2]) return board.victory(board[i][1]);//horizontal strike
		else if ( board[0][i] === board[1][i] &&
							board[0][i] === board[2][i]) return board.victory(board[1][i]);//vertical strike
		if(board[0][i] < 10 || board[1][i] < 10 || board[2][i] < 10) draw = false;
	}
	board.status = draw?4:1;
};
board.victory = function(player){
	if(player===o) board.status = 3;
	else if (player===x) board.status = 2;
	else return "error";
	stop();
};
board.makeMoves = function(moves,player){
  if(moves[0]===x){
  	localPlayer = o;
  	remotePlayer = x;}
  else if(moves[0]===o){ 
  	localPlayer = x;
  	remotePlayer = o;}
  else for (var turn = 0; turn < moves.length; turn++){
  	board[moves[turn][0]][moves[turn][1]] = player;
  }
  myTurn = false;
  board.updateStatus();
  refreshBoard();
};
function refreshBoard (){
	var boardView = document.getElementById("game-board").childNodes[0];
	for ( i = 0; i < 3; i++){
		var row = boardView.childNodes[i];
		for ( j = 0; j < 3; j++){
			var cell = row.childNodes[j];
			if (board[i][j]===x){ 
				cell.className = "XCell";
				cell.innerHTML = x;
			}
			else if (board[i][j]===o) {
				cell.className = "OCell";
				cell.innerHTML = o;
			}
		}
	}
	refreshStatusBar();
}
function initializeMatch (){
	localPlayer = x;
	remotePlayer = o;
	board.status = 1;
	actions[3]("{\"matchId\": " + matchId + ",\"playerId\": " + ticketId+ ", \"turn\": \"" + localPlayer + "\"}");
};


serverController = [];
controller = serverController;



serverController.doGameAction = function (action, params, cb){
	serverController.sendPostRequest("/api/"+action+"/", params, cb);
	return serverController.response;
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

actions = [
	function(){
	clientLog("sent ticket request");
	serverController.doGameAction("ticket","",function(ticketResponse){
		ticketId=ticketResponse;
 		clientLog("local player got ticket "+ ticketId);
 	});}
	,
	function(){
	clientLog("sent match request");
	serverController.doGameAction("match","{\"playerId\": "+ticketId+"}", function(matchResponse){
		matchId = matchResponse;
 		clientLog("matchId : "+ matchId);
	});}
	,
	function(){
	clientLog("sent wait request");
	serverController.doGameAction("wait","{\"matchId\": "+matchId+",\"playerId\": "+ticketId+"}", 
		function(waitResponse){
			res = JSON.parse(waitResponse);
			myTurn = res.next;
			currentPlayer = myTurn?localPlayer:remotePlayer;
			refreshStatusBar();
			if(res.turns.length) board.makeMoves(res.turns,remotePlayer);
			else if (myTurn && !board.started()) initializeMatch();   //If first turn && myTurn, this client initializes
			clientLog("it "+(myTurn?"IS":"IS NOT")+" my turn");
	});}
	,
	function(string){
	clientLog("sent submit");
	serverController.doGameAction("submit",string,
		function(submitResponse){
			clientLog("submit answered");
			myTurn=false;
			currentPlayer = myTurn?localPlayer:remotePlayer;
			refreshStatusBar();
		});}
];




function clickThisCell (){
	if(!myTurn) return;
	if(board[this.id[0]][this.id[1]]>9) return;
	actions[3]("{\"matchId\":" + matchId + ",\"playerId\":" + ticketId + ",\"turn\":\"" + this.id +"\"}");
	board.makeMoves([this.id],localPlayer);
	refreshBoard();
}



function clientLog (text) {
	var textArea = document.getElementById("log");
	var newLine = document.createTextNode(activityLine++ + ":\t" + text+"\n");
	textArea.appendChild(newLine);
	autoScroll?textArea.focus():textArea.blur();
	textArea.blur();
}

function refreshStatusBar (){
	var gameInfo = document.getElementById("game-info");
	if(board.gS()!==1)	gameInfo.innerHTML = statuses[board.gS()];
	else gameInfo.innerHTML = statuses[board.gS()] + " playing as " + localPlayer + ", it is " + currentPlayer + "'s turn";
}

function play () {
	clearInterval(runningGame);
	runningGame = setInterval(waitLoop,intervalMilisecs);
}

function stop () {
	clearInterval(runningGame);
}

function reset (){
	stop();
	board = [[1,2,3],[4,5,6],[7,8,9]]; 
	ticketId = 0;
}

function waitLoop (){
	if(!ticketId) actions[0]();
	else if (!matchId) actions[1]();
	else if (!myTurn) actions[2]();
	else if (!board.started) refreshStatusBar();
}


var boardView = document.getElementById("game-board");
var control = document.getElementById("control");
boardView.appendChild(board.gT());
refreshBoard();



document.getElementById("controller-url").onchange = function(){serverController.updateURL(this.value);};
document.getElementById("run-button").onclick = play;
document.getElementById("stop-button").onclick = stop;
