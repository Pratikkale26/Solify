import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Keypair, Transaction, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
const bs58 = (await import("bs58")).default;
import cors from 'cors';
import { authMiddleware, AuthRequest } from './authmiddleware.js';

dotenv.config();

const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com");

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "https://solify.kalehub.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.options("*", cors());

app.use(express.json());
const client = new PrismaClient();

// Signup
app.post('/api/v1/signup', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ msg: "You need to provide both username and password" });
            return
        }

        const isUser = await client.user.findUnique({ where: { username } });
        if (isUser) {
            res.status(400).json({ msg: "User already exists, please sign in!" });
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const keypair = Keypair.generate();

        await client.user.create({
            data: {
                username,
                password: hashedPassword,
                publicKey: keypair.publicKey.toBase58(),
                privateKey: bs58.encode(keypair.secretKey)
            }
        });

        res.json({ publicKey: keypair.publicKey.toBase58() });
    } catch (error: any) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Signin
app.post('/api/v1/signin', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ msg: "Provide both username and password" });
            return
        }

        const user = await client.user.findUnique({ where: { username } });
        if (!user) {
            res.status(403).json({ msg: "User not found, please sign up!" });
            return
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(403).json({ msg: "Incorrect password!" });
            return
        }

        if (!process.env.JWT_SECRET) {
            res.status(500).json({ msg: "Server error: missing JWT_SECRET" });
            return
        }

        const token = jwt.sign({ id: username }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, publicKey: user.publicKey, message: "Signed in successfully" });
    } catch (error: any) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Transaction Signing & Sending
app.post('/api/v1/txn/sign', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.username) {
            res.status(401).json({ error: "Unauthorized request, please sign in" });
            return
        }

        const { message } = req.body;
        const user = await client.user.findUnique({ where: { username: req.user.username } });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        const keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(user.privateKey)));

        const { blockhash } = await connection.getLatestBlockhash();
        const txn = Transaction.from(Buffer.from(message, "base64"));
        txn.recentBlockhash = blockhash;
        txn.feePayer = keypair.publicKey;

        txn.sign(keypair);
        const signature = await connection.sendTransaction(txn, [keypair]);

        res.json({ message: "Transaction Signed & Sent!", signature });
    } catch (error: any) {
        console.error("Error signing transaction:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Fetch User Balance
app.get('/api/v1/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.username) {
            res.status(401).json({ error: "User is not authenticated" });
            return
        }

        const user = await client.user.findUnique({ where: { username: req.user.username } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        const balance = await connection.getBalance(new PublicKey(user.publicKey));
        res.json({ balance: balance / LAMPORTS_PER_SOL });
    } catch (error: any) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
});

// Fetch Balance of Any Wallet
app.get('/api/v1/balance2', async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress) {
            res.status(400).json({ error: "Please provide a valid wallet address." });
            return
        }

        const balance = await connection.getBalance(new PublicKey(walletAddress as string));
        res.json({ balance: balance / LAMPORTS_PER_SOL });
    } catch (error: any) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
});

// Airdrop
app.post('/api/v1/airdrop', async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            res.status(400).json({ error: "Please provide a valid wallet address." });
            return
        }

        const signature = await connection.requestAirdrop(new PublicKey(walletAddress), LAMPORTS_PER_SOL);
        res.json({ message: "Airdrop successful", signature });
    } catch (error: any) {
        console.error("Airdrop failed:", error);
        res.status(500).json({ error: "Airdrop failed", details: error.message });
    }
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
