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
const base58_1 = __importDefault(require("base58"));
dotenv_1.default.config();
const connection = new web3_js_1.Connection("https://solana-devnet.g.alchemy.com/v2/02RfDld8FSNkt6LNuvBQWXwejneybGP9");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const client = new client_1.PrismaClient();
// Signup
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({
            msg: "You need to provide both username and password"
        });
        return;
    }
    const isUser = yield client.user.findUnique({ where: { username } });
    if (isUser) {
        res.status(400).json({ msg: "User with this username already exists, please sign in!" });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const keypair = web3_js_1.Keypair.generate();
    yield client.user.create({
        data: {
            username,
            password: hashedPassword,
            publicKey: keypair.publicKey.toString(),
            privateKey: keypair.secretKey.toString()
        }
    });
    res.json({ publicKey: keypair.publicKey.toBase58() });
}));
// Signin
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ msg: "You need to provide both username and password" });
        return;
    }
    const user = yield client.user.findUnique({
        where: {
            username
        }
    });
    if (!user) {
        res.status(403).json({ msg: "User with this username not found, please sign up!" });
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
    const token = jsonwebtoken_1.default.sign({
        id: username
    }, process.env.JWT_SECRET);
    res.json({ token, message: "Signed in successfully" });
}));
// transaction signing
app.post('/api/v1/txn/sign', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serializeTxn = req.body.message;
    const txn = web3_js_1.Transaction.from(serializeTxn);
    // const user= await client.user.findFirst({
    //     where:{
    //         id: ""
    //     }
    // })
    // TODO: here i am randomly generating the pvt-pub keypair but, need to write the logic to sign it with the keypair of that user 
    const keypair = web3_js_1.Keypair.fromSecretKey(base58_1.default.decode(process.env.PRIVATE_KEY));
    txn.sign(keypair);
    yield connection.sendTransaction(txn);
    res.json({ message: "Transaction Done!" });
}));
// getting transactions
app.get('/api/v1/txn', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: "Transactions fetched successfully!" });
}));
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
