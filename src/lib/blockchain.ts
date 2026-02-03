import { ethers } from "ethers";
import FairTicketArtifact from "./FairTicket.json";

// Hardhat Localhost
const RPC_URL = "http://127.0.0.1:8545";

// Hardhat Account #0 Private Key (Test only!)
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Deployed Contract Address (Update if redeployed)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Initialize Provider and Signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize Contract
const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    FairTicketArtifact.abi,
    wallet
);

export async function mintTicketOnChain(buyerAddress: string, price: number) {
    try {
        console.log(`🔗 Minting ticket for ${buyerAddress} at price ${price}...`);

        // Call the mint function on the smart contract
        // Note: Price is likely in wei or similar. For simulation, we pass it as is or convert.
        // Assuming price is in ETH for simplicity in simulation, or just a number.
        // The contract expects uint256.
        const priceInWei = ethers.parseEther(price.toString());

        const tx = await contract.mintTicket(buyerAddress, priceInWei);

        console.log(`⏳ Transaction sent: ${tx.hash}`);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        console.log(`✅ Ticket minted on-chain! Block: ${receipt.blockNumber}`);

        return {
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error("❌ Blockchain minting failed:", error);
        throw error;
    }
}
