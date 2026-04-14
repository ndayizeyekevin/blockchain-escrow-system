/**
 * Deployment Script for EscrowPayment Contract
 * This script deploys the smart contract to the specified network
 * 
 * Usage:
 * npx hardhat run scripts/deploy.js --network sepolia
 * npx hardhat run scripts/deploy.js --network localhost
 */

async function main() {
  console.log("Starting contract deployment...\n");

  // Get the contract factory
  const EscrowPayment = await ethers.getContractFactory("EscrowPayment");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract from account: ${deployer.address}\n`);

  // Deploy the contract
  console.log("Deploying EscrowPayment contract...");
  const escrowPayment = await EscrowPayment.deploy();
  
  // Wait for the contract to be mined
  await escrowPayment.waitForDeployment();
  
  const contractAddress = await escrowPayment.getAddress();
  
  console.log("✓ Contract deployed successfully!\n");
  console.log("=".repeat(60));
  console.log("Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.log("=".repeat(60));
  
  console.log("\nNext steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Add it to your .env file as ESCROW_CONTRACT_ADDRESS");
  console.log("3. Use the contract address in your frontend application");
  
  // If on Sepolia, provide Etherscan link
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 11155111) {
    console.log(`\nView on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }
  
  return contractAddress;
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
