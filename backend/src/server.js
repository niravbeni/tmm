"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('Environment:', NODE_ENV);
console.log('Frontend URL:', FRONTEND_URL);
console.log('Server running on port:', PORT);
// Middleware
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express_1.default.json());
// API Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: NODE_ENV });
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    // Add this configuration for better WebSocket behavior behind proxies
    transports: ['websocket', 'polling'],
    allowEIO3: true
});
// Card deck functions
function createFullDeck() {
    return Array.from({ length: 108 }, (_, i) => `card${i + 1}.png`);
}
function shuffleDeck(deck) {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function dealCards(deck, count) {
    const cards = deck.slice(0, count);
    const remainingDeck = deck.slice(count);
    return { cards, remainingDeck };
}
// Initialize game state
const gameState = {
    teams: {},
    storytellerTeam: '',
    storytellerCard: '',
    playedCards: [],
    votes: {},
    currentPhase: 'lobby',
    roundNumber: 1,
    deck: shuffleDeck(createFullDeck()),
    discardPile: [],
};
// Helper function to select a random storyteller
function selectRandomStoryteller() {
    const teamNames = Object.keys(gameState.teams);
    if (teamNames.length === 0)
        return '';
    const randomIndex = Math.floor(Math.random() * teamNames.length);
    return teamNames[randomIndex];
}
// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    // Register team
    socket.on('registerTeam', (teamName, isHost = false) => {
        // Deal 6 cards from the deck
        const { cards, remainingDeck } = dealCards(gameState.deck, 6);
        gameState.deck = remainingDeck;
        // Create the team with the dealt cards
        gameState.teams[teamName] = {
            hand: cards,
            score: 0,
            socketId: socket.id,
            isHost: isHost
        };
        // If this team is the host, set the hostId
        if (isHost) {
            gameState.hostId = socket.id;
            console.log(`Host registered: ${teamName}`);
        }
        // If this is the first team or there's no storyteller yet, make them the storyteller
        if (Object.keys(gameState.teams).length === 1 || !gameState.storytellerTeam) {
            gameState.storytellerTeam = teamName;
            console.log(`Initial storyteller set to: ${teamName}`);
        }
        socket.join(teamName);
        io.emit('gameStateUpdate', gameState);
        console.log(`Team registered: ${teamName}, cards remaining: ${gameState.deck.length}`);
    });
    // Submit card
    socket.on('submitCard', ({ teamName, cardIndex }) => {
        // Prevent card submission if game hasn't been started yet
        if (gameState.currentPhase === 'lobby') {
            console.log(`Rejected card submission from ${teamName} - game not started yet`);
            return;
        }
        const team = gameState.teams[teamName];
        if (!team)
            return;
        // Get the card and add to played cards
        const card = team.hand[cardIndex];
        gameState.playedCards.push({
            teamName,
            card,
        });
        // If this is the storyteller, mark their card
        if (teamName === gameState.storytellerTeam) {
            gameState.storytellerCard = card;
        }
        // Remove from hand and add to discard pile
        const newHand = [...team.hand];
        newHand.splice(cardIndex, 1);
        team.hand = newHand;
        gameState.discardPile.push(card);
        // Send updated state to all clients
        io.emit('gameStateUpdate', gameState);
        console.log(`Card submitted by ${teamName}:`, card);
        // Check if all teams have submitted
        if (gameState.playedCards.length === Object.keys(gameState.teams).length) {
            gameState.currentPhase = 'vote';
            // Ensure votes is initialized as an empty object
            gameState.votes = {};
            // First send the updated gameState to all clients
            io.emit('gameStateUpdate', gameState);
            // THEN emit the votePhaseStarted event
            setTimeout(() => {
                io.emit('votePhaseStarted');
            }, 50);
        }
    });
    // Submit vote
    socket.on('submitVote', ({ teamName, votedCardIndex }) => {
        var _a;
        // Prevent storyteller from voting
        if (teamName === gameState.storytellerTeam) {
            console.log(`Rejected vote from storyteller team ${teamName}`);
            return;
        }
        // Prevent voting for your own card
        if (((_a = gameState.playedCards[votedCardIndex]) === null || _a === void 0 ? void 0 : _a.teamName) === teamName) {
            console.log(`Rejected vote from ${teamName} for their own card`);
            return;
        }
        gameState.votes[teamName] = votedCardIndex;
        // Count teams that should be voting (all teams except the storyteller)
        const votingTeams = Object.keys(gameState.teams).filter(team => team !== gameState.storytellerTeam);
        const votesReceived = Object.keys(gameState.votes);
        console.log(`Vote status: received ${votesReceived.length}/${votingTeams.length} votes`);
        console.log(`Teams that should vote: ${votingTeams.join(', ')}`);
        console.log(`Teams that voted: ${votesReceived.join(', ')}`);
        // Check if all non-storyteller teams have voted
        if (votesReceived.length >= votingTeams.length) {
            console.log('All teams have voted, transitioning to results/waiting');
            // Calculate scores based on votes
            calculateScores();
            gameState.currentPhase = 'results';
            // Emit a resultsPhaseStarted event instead of navigate
            io.emit('resultsPhaseStarted');
        }
        io.emit('gameStateUpdate', gameState);
        console.log(`Vote submitted by ${teamName}:`, votedCardIndex);
    });
    // Next round
    socket.on('nextRound', () => {
        // Handle initial game start
        if (gameState.currentPhase === 'lobby') {
            // Set initial storyteller if not already set
            if (!gameState.storytellerTeam && Object.keys(gameState.teams).length > 0) {
                gameState.storytellerTeam = selectRandomStoryteller();
                console.log(`Initial storyteller set to: ${gameState.storytellerTeam}`);
            }
            // Start the game with hand phase
            gameState.currentPhase = 'hand';
            // Send game state update
            io.emit('gameStateUpdate', gameState);
            // Inform players to go to hand page, results page will stay as is
            io.emit('nextRoundStarted');
            console.log('Game started, initial phase: hand');
            return;
        }
        // Regular next round functionality
        gameState.playedCards = [];
        gameState.votes = {};
        gameState.currentPhase = 'hand';
        gameState.roundNumber++;
        // Select a random storyteller for the new round
        gameState.storytellerTeam = selectRandomStoryteller();
        console.log(`New storyteller for round ${gameState.roundNumber}: ${gameState.storytellerTeam}`);
        // Deal new cards to all teams
        Object.values(gameState.teams).forEach(team => {
            // Calculate how many cards the team needs
            const cardsNeeded = 6 - team.hand.length;
            if (cardsNeeded > 0) {
                // If deck is too small, shuffle discard pile back in
                if (gameState.deck.length < cardsNeeded) {
                    console.log('Reshuffling discard pile into deck');
                    gameState.deck = shuffleDeck([...gameState.deck, ...gameState.discardPile]);
                    gameState.discardPile = [];
                }
                // Deal new cards to the team
                const { cards, remainingDeck } = dealCards(gameState.deck, cardsNeeded);
                gameState.deck = remainingDeck;
                team.hand = [...team.hand, ...cards];
            }
        });
        io.emit('gameStateUpdate', gameState);
        // Send a nextRound notification instead of forcing navigation
        // This allows clients to decide whether to navigate or stay on results
        io.emit('nextRoundStarted');
        console.log('Next round started, cards remaining:', gameState.deck.length);
    });
    // Reset game
    socket.on('resetGame', () => {
        // Reset deck and discard pile
        const fullDeck = shuffleDeck(createFullDeck());
        gameState.deck = fullDeck;
        gameState.discardPile = [];
        // Clear all teams instead of resetting their state
        gameState.teams = {};
        // Reset game state
        gameState.storytellerTeam = '';
        gameState.storytellerCard = '';
        gameState.playedCards = [];
        gameState.votes = {};
        gameState.currentPhase = 'lobby';
        gameState.roundNumber = 1;
        // Update game state but don't force navigation
        io.emit('gameStateUpdate', gameState);
        console.log('Game reset, all teams removed, deck reshuffled, cards remaining:', gameState.deck.length);
    });
    socket.on('setHost', (teamName) => {
        // Set this team as the host
        if (gameState.teams[teamName]) {
            gameState.teams[teamName].isHost = true;
            gameState.hostId = socket.id;
            console.log(`${teamName} is now the host/facilitator`);
            io.emit('gameStateUpdate', gameState);
        }
    });
    socket.on('disconnect', () => {
        var _a;
        // Find and remove team with this socket ID
        const teamNameToRemove = (_a = Object.entries(gameState.teams)
            .find(([_, team]) => team.socketId === socket.id)) === null || _a === void 0 ? void 0 : _a[0];
        if (teamNameToRemove) {
            // Return any cards from the team's hand to the discard pile
            gameState.discardPile = [
                ...gameState.discardPile,
                ...gameState.teams[teamNameToRemove].hand
            ];
            delete gameState.teams[teamNameToRemove];
            io.emit('gameStateUpdate', gameState);
            console.log(`Team disconnected: ${teamNameToRemove}`);
        }
        console.log('Client disconnected:', socket.id);
    });
});
// Helper function to calculate scores based on votes
function calculateScores() {
    // First, identify the storyteller card index
    const storytellerCardIndex = gameState.playedCards.findIndex(card => card.teamName === gameState.storytellerTeam);
    if (storytellerCardIndex === -1) {
        console.error('Storyteller card not found!');
        return;
    }
    // Count votes for each card
    const votesByCard = [];
    for (let i = 0; i < gameState.playedCards.length; i++) {
        const voteCount = Object.values(gameState.votes).filter(vote => vote === i).length;
        votesByCard.push(voteCount);
    }
    // Count votes for storyteller's card (we know the index exists at this point)
    const votesForStoryteller = votesByCard[storytellerCardIndex];
    const totalTeams = Object.keys(gameState.teams).length;
    // Check if everyone or no one found the storyteller's card
    const everyoneFoundStoryteller = votesForStoryteller === totalTeams - 1;
    const nobodyFoundStoryteller = votesForStoryteller === 0;
    if (everyoneFoundStoryteller || nobodyFoundStoryteller) {
        // Everyone or no one found the storyteller's card
        // Storyteller gets 0 points, everyone else gets 2
        Object.keys(gameState.teams).forEach(teamName => {
            if (teamName !== gameState.storytellerTeam) {
                gameState.teams[teamName].score += 2;
            }
        });
    }
    else {
        // Some but not all found the storyteller's card
        // Storyteller gets 3 points
        if (gameState.teams[gameState.storytellerTeam]) {
            gameState.teams[gameState.storytellerTeam].score += 3;
        }
        // Teams that found the storyteller's card get 3 points
        Object.entries(gameState.votes).forEach(([votingTeam, votedIndex]) => {
            if (votedIndex === storytellerCardIndex && votingTeam !== gameState.storytellerTeam) {
                gameState.teams[votingTeam].score += 3;
            }
        });
    }
    // Award points for votes on non-storyteller cards (1 point per vote)
    Object.entries(gameState.votes).forEach(([votingTeam, votedIndex]) => {
        // Skip votes for storyteller's card - those are handled above
        if (votedIndex !== storytellerCardIndex) {
            const votedCard = gameState.playedCards[votedIndex];
            if (gameState.teams[votedCard.teamName]) {
                gameState.teams[votedCard.teamName].score += 1;
            }
        }
    });
    console.log('Scores calculated:', Object.entries(gameState.teams).map(([teamName, team]) => `${teamName}: ${team.score}`).join(', '));
}
// API endpoint for getting current game state
app.get('/api/gamestate', (req, res) => {
    // Don't expose deck in the API response
    const { deck, discardPile } = gameState, safeGameState = __rest(gameState, ["deck", "discardPile"]);
    res.json(safeGameState);
});
// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
