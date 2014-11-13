'use strict';

var mongoose = require('mongoose'),
	 Schema = mongoose.Schema;

// player = {
//   playerIndex
//   lastSeenTurn
//   name
//   elo
// }

var matchSchema = new Schema({
	players: {},
	init_date: Date,
	turns: Array,
	active: [Boolean]
});

matchSchema.methods.numPlayers = function() {
	return this.active.length;
};

matchSchema.methods.lastTurn = function() {
	return this.turns.length - 1;
};

matchSchema.methods.retire = function(playerId) {
	this.active[this.players[playerId].playerIndex] = false;
	this.markModified('active');
};

matchSchema.methods.containsPlayer = function(playerId) {
	return this.players.hasOwnProperty(playerId);
};

matchSchema.methods.isActive = function(playerId) {
	return this.active[this.players[playerId].playerIndex];
};

matchSchema.methods.isTurnOf = function(playerId) {
	return (this.turns.length % this.numPlayers())+'' === this.players[playerId].playerIndex;
};

matchSchema.methods.sawTurns = function(playerId) {
	this.players[playerId].lastSeenTurn = this.lastTurn();
	this.markModified('players');
};

matchSchema.methods.isActive = function() {
	for(var i in this.active) {
		if(this.active[i]) return true;
	}
	return false;
};

matchSchema.methods.currentPlayer = function() {
	var players = this.players,
			pid;
	if(!this.isActive()) return null;
	for(pid in players){
		if(!players.hasOwnProperty(pid)) continue;
		console.log(pid,this.isTurnOf(pid));
		if(this.isTurnOf(pid)) return {
			name: players[pid].name,
			elo: players[pid].elo
		};
	}
	return null;
};

matchSchema.methods.fastForward = function() {
	if(!this.isActive()) return; // Avoid Infinite Loop

	var current = this.turns.length % this.numPlayers();
	var mod = false;
	while(!this.active[current]) {
		mod = true;
		current = (current+1) % this.numPlayers();
		this.turns.push(null);
	}

	if(mod) this.markModified('turns');

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
	var i, ticket, players = {}, active = [];
	for( i in tickets ) {
		ticket = tickets[i];
		players[ticket.id] = {
			name         : ticket.name,
			elo          : ticket.elo,
			playerIndex  : i,
			lastSeenTurn : -1
		};
		active[i] = true;
	}

	return new Match({
		players       : players,
		init_date     : new Date(),
		turns         : [],
		active : active
	});
};

mongoose.model('Match', matchSchema);
