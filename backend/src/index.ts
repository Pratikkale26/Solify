import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Keypair, Transaction, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import bs58 from 'bs58';
import cors from 'cors';
import { authMiddleware, AuthRequest } from './authmiddleware';

dotenv.config();

const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com");

const app = express();
app.use(express.json());
app.use(cors());
const client = new PrismaClient();

// Signup
app.post('/api/v1/signup', async (req: Request, res: Response) => {
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
});

// Signin
app.post('/api/v1/signin', async (req: Request, res: Response) => {
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

    const token = jwt.sign({ id: username }, process.env.JWT_SECRET);

    res.json({ token, publicKey: user.publicKey, message: "Signed in successfully" });
});

// Transaction Signing & Sending
app.post('/api/v1/txn/sign', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { message } = req.body;
    const username = req.user?.username;

    if (!username) {
        res.status(400).json({ error: "Unauthorized request, please sign in" });
        return
    } 


    try {
        const user = await client.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        const keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(user.privateKey)))

        // get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();

        // add blockhash and feepayer to txn
        const txn = Transaction.from(Buffer.from(message, "base64"));
        txn.recentBlockhash = blockhash;
        txn.feePayer = keypair.publicKey;

        txn.sign(keypair);  // Sign 

        const signature = await connection.sendTransaction(txn, [keypair]);

        res.json({ message: "Transaction Signed & Sent!", signature });
    } catch (error: any) {
        console.error("Error signing transaction:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Fetch User Balance
app.get('/api/v1/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
    const username = req.user?.username;

    if (!username) {
        res.status(400).json({ error: "User is not authenticated" });
        return
    }

    try {
        const user = await client.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        const publicKey = new PublicKey(user.publicKey);
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / 1e9; // lamports to sol

        res.json({ message: "Balance fetched successfully!", balance: solBalance });
    } catch (error: any) {
        console.error("Error fetching balance:", error);
        res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
});

// fetch balance of others
app.get('/api/v1/balance2', async (req: Request, res: Response) => {
    const { walletAddress } = req.query;
  
    if (!walletAddress) {
      res.status(400).json({ error: "Please provide a valid wallet address." });
      return
    }
  
    try {
      const publicKey = new PublicKey(walletAddress as string);
      const balance = await connection.getBalance(publicKey);
  
      const solBalance = balance / 1e9;
      res.json({ balance: solBalance });
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Failed to fetch balance", details: error.message });
    }
  });
  

// Airdrop route
app.post('/api/v1/airdrop', async (req: Request, res: Response) => {
    const { walletAddress } = req.body;
  
    if (!walletAddress) {
      res.status(400).json({ error: "Please provide a valid wallet address." });
      return
    }
  
    try {
      const publicKey = new PublicKey(walletAddress);
  
      // Request 1 SOL airdrop- dont want to take all for me
      const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL * 1); // 1 SOL = 1e9 lamports
  
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
