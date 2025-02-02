import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Keypair, Transaction, Connection } from '@solana/web3.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
//@ts-ignore
import base58 from 'base58'
import cors from 'cors'
import { authMiddleware, AuthRequest } from './authmiddleware'

dotenv.config();

const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com")

const app = express();
app.use(express.json());
app.use(cors())
const client = new PrismaClient();

// Signup
app.post('/api/v1/signup', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({
            msg: "You need to provide both username and password"
        });
        return
    }

    const isUser = await client.user.findUnique({ where: { username } });
    if (isUser) {
        res.status(400).json({ msg: "User with this username already exists, please sign in!" });
        return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const keypair = Keypair.generate();

    await client.user.create({
        data: {
            username,
            password: hashedPassword,
            publicKey: keypair.publicKey.toString(),
            privateKey: keypair.secretKey.toString() // TODO: dumbest approah of all i thought earlier
        }
    });

    res.json({ publicKey: keypair.publicKey.toBase58() });
});

// Signin
app.post('/api/v1/signin', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ msg: "You need to provide both username and password" });
        return
    }

    const user = await client.user.findUnique({
        where: {
            username
        }});
    if (!user) {
        res.status(403).json({ msg: "User with this username not found, please sign up!" });
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

    const token = jwt.sign({
        id: username
    }, process.env.JWT_SECRET);

    res.json({ token, publicKey: user.publicKey, message: "Signed in successfully" });
});

// transaction signing
app.post('/api/v1/txn/sign', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { message } = req.body;
    const username = req.user?.username;

    if (!username) {
        res.status(400).json({ error: "Unauthorized request sent, please sign in and try again" });
        return
    }

    try {
        const user = await client.user.findUnique({ where: { username } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return
        }

        // Decode the transaction message and sign it
        const txn = Transaction.from(Buffer.from(message, "base64"));
        const keypair = Keypair.fromSecretKey(base58.decode(user.privateKey)); // sign with the user's private key
        txn.sign(keypair);

        // Get the latest blockhash and set it on the transaction
        const { blockhash } = await connection.getLatestBlockhash();
        txn.recentBlockhash = blockhash;
        txn.feePayer = keypair.publicKey;

        // Send the transaction
        const signature = await connection.sendTransaction(txn, [keypair], { skipPreflight: false, preflightCommitment: "processed" });

        // Optionally confirm the transaction
        const confirmation = await connection.confirmTransaction(signature, "processed");

        if (confirmation.value.err) {
            res.status(500).json({ error: "Transaction failed", details: confirmation.value.err });
            return
        }

        res.json({ message: "Transaction Signed & Sent!", signature });
    } catch (error: any) {
        console.error("Error signing transaction:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


// getting transactions
app.get('/api/v1/txn', async (req: Request, res: Response) => {
    res.json({ message: "Transactions fetched successfully!" });
});



const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
