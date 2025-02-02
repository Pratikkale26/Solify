"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const web3_js_1 = require("@solana/web3.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const bs58_1 = __importDefault(require("bs58"));
const cors_1 = __importDefault(require("cors"));
const authmiddleware_1 = require("./authmiddleware");
dotenv_1.default.config();
const connection = new web3_js_1.Connection(process.env.RPC_URL || "https://api.devnet.solana.com");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const client = new client_1.PrismaClient();
// Signup
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ msg: "You need to provide both username and password" });
        return;
    }
    const isUser = yield client.user.findUnique({ where: { username } });
    if (isUser) {
        res.status(400).json({ msg: "User already exists, please sign in!" });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const keypair = web3_js_1.Keypair.generate();
    yield client.user.create({
        data: {
            username,
            password: hashedPassword,
            publicKey: keypair.publicKey.toBase58(),
            privateKey: bs58_1.default.encode(keypair.secretKey)
        }
    });
    res.json({ publicKey: keypair.publicKey.toBase58() });
}));
// Signin
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ msg: "Provide both username and password" });
        return;
    }
    const user = yield client.user.findUnique({ where: { username } });
    if (!user) {
        res.status(403).json({ msg: "User not found, please sign up!" });
        return;
    }
    const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordMatch) {
        res.status(403).json({ msg: "Incorrect password!" });
        return;
    }
    if (!process.env.JWT_SECRET) {
        res.status(500).json({ msg: "Server error: missing JWT_SECRET" });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: username }, process.env.JWT_SECRET);
    res.json({ token, publicKey: user.publicKey, message: "Signed in successfully" });
}));
// Transaction Signing & Sending
app.post('/api/v1/txn/sign', authmiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { message } = req.body;
    const username = (_a = req.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(400).json({ error: "Unauthorized request, please sign in" });
        return;
    }
    try {
        const user = yield client.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(bs58_1.default.decode(user.privateKey)));
        // get latest blockhash
        const { blockhash } = yield connection.getLatestBlockhash();
        // add blockhash and feepayer to txn
        const txn = web3_js_1.Transaction.from(Buffer.from(message, "base64"));
        txn.recentBlockhash = blockhash;
        txn.feePayer = keypair.publicKey;
        txn.sign(keypair); // Sign 
        const signature = yield connection.sendTransaction(txn, [keypair]);
        res.json({ message: "Transaction Signed & Sent!", signature });
    }
    catch (error) {
        console.error("Error signing transaction:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}));
// Fetch User Balance
app.get('/api/v1/balance', authmiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const username = (_a = req.user) === null || _a === void 0 ? void 0 : _a.username;
    if (!username) {
        res.status(400).json({ error: "User is not authenticated" });
        return;
    }
    try {
        const user = yield client.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const publicKey = new web3_js_1.PublicKey(user.publicKey);
        const balance = yield connection.getBalance(publicKey);
        const solBalance = balance / 1e9; // lamports to sol
        res.json({ message: "Balance fetched successfully!", balance: solBalance });
    }
    catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
}));
// fetch balance of others
app.get('/api/v1/balance2', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress } = req.query;
    if (!walletAddress) {
        res.status(400).json({ error: "Please provide a valid wallet address." });
        return;
    }
    try {
        const publicKey = new web3_js_1.PublicKey(walletAddress);
        const balance = yield connection.getBalance(publicKey);
        const solBalance = balance / 1e9;
        res.json({ balance: solBalance });
    }
    catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
}));
// Airdrop route
app.post('/api/v1/airdrop', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        res.status(400).json({ error: "Please provide a valid wallet address." });
        return;
    }
    try {
        const publicKey = new web3_js_1.PublicKey(walletAddress);
        // Request 1 SOL airdrop- dont want to take all for me
        const signature = yield connection.requestAirdrop(publicKey, web3_js_1.LAMPORTS_PER_SOL * 1); // 1 SOL = 1e9 lamports
        res.json({ message: "Airdrop successful", signature });
    }
    catch (error) {
        console.error("Airdrop failed:", error);
        res.status(500).json({ error: "Airdrop failed", details: error.message });
    }
}));
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
