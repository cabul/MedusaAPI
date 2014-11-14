'use strict';

var mongoose = require('mongoose'),
		Schema   = mongoose.Schema;

var matchSchema = new Schema({
	players       : {},
	sortedPlayers : Array,
	init_date     : Date,
	turns         : Array,
	active        : Boolean
});

matchSchema.methods.numPlayers = function() {
	return this.sortedPlayers.length;
};

matchSchema.methods.currentTurn = function() {
	return this.turns.length % this.numPlayers();
};

matchSchema.methods.currentPlayer = function() {
	return this.sortedPlayers[this.currentTurn()];
};

matchSchema.methods.retire = function(playerId) {
	this.players[playerId].active = false;
	var match = this;
	this.markModified('players');
	var i,len;
	for( i = 0, len = this.sortedPlayers.length; i<len; i+=1 ) {
		if(this.isPlaying(this.sortedPlayers[i])) return;
	}
	this.active = false;
	this.markModified('active');
};

matchSchema.methods.contains = function(playerId) {
	return this.players.hasOwnProperty(playerId);
};

matchSchema.methods.isPlaying = function(playerId) {
	return this.players[playerId].active;
};

matchSchema.methods.isTurnOf = function(playerId) {
	return this.sortedPlayers.indexOf(playerId) === this.currentTurn();
};

matchSchema.methods.isUpdated = function(playerId) {
	return this.players[playerId].lastSeenTurn === this.turns.length;
};

matchSchema.methods.updateFor = function(playerId) {
	var unseenTurns = [],
			last        = this.players[playerId].lastSeenTurn,
			turns       = this.turns,
			len         = turns.length;

	while(last < len) {
		unseenTurns.push(turns[last]);
		last+=1;
	}

	this.players[playerId].lastSeenTurn = this.turns.length;
	this.markModified('players');

	return unseenTurns;

};

matchSchema.methods.fastForward = function() {
	if(!this.active) return; // Avoid Infinite Loop

	var mod = false;

	var match = this;

	this.sortedPlayers.forEach(function(pid){

		console.log(pid+' is '+(match.isPlaying(pid)?'':'not ')+'playing');

	});

	while( !this.isPlaying(this.currentPlayer()) ) {
		console.log(this.currentPlayer()+' is not playing');
		this.turns.push(null);
		mod = true;
	}

	if(mod) this.markModified('turns');

};

matchSchema.methods.allPlayers = function(playerId) {

	var players = [], pid,player;
	for( pid in this.players ) {
		if(!this.contains(pid)) continue;
		player = this.players[pid];
		players.push({
			name   : player.name,
			elo    : player.elo,
			enemy  : (pid !== playerId),
			active : player.active
		});
	}
	players.sort(function(a,b){ return a.index-b.index; });
	return players;
};

matchSchema.methods.playerIds = function() {
	var ids = [],pid;
	for(pid in this.players) {
		if(!this.players.hasOwnProperty(pid)) continue;
		ids.push(pid);
	}
	return ids;
};

matchSchema.statics.createFromTickets = function(tickets) {
	var Match = this.model('Match');
	var i, ticket, players = {}, sortedPlayers = [];
	for( i in tickets ) {
		ticket = tickets[i];
		players[ticket.id] = {
			name         : ticket.name,
			elo          : ticket.elo,
			lastSeenTurn : 0,
			active       : true
		};
		sortedPlayers.push(ticket._id);
	}

	return new Match({
		players       : players,
		init_date     : new Date(),
		turns         : [],
		sortedPlayers : sortedPlayers,
		active        : true
	});
};

mongoose.model('Match', matchSchema);
