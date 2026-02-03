const hre = require("hardhat");

async function main() {
    const ticket = await hre.ethers.deployContract("FairTicket");

    await ticket.waitForDeployment();

    console.log(
        `FairTicket deployed to ${ticket.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
