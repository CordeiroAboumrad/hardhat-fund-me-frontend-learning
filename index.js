import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const ownerButton = document.getElementById("ownerButton");
let amountToFund = document.getElementById("amountToFund");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdrawMoney;
ownerButton.onclick = getOwner;

console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        document.getElementById("connectButton").innerHTML = "Connected";
        document.getElementById("connectButton").disabled = true;
    } else {
        document.getElementById("connectButton").innerHTML =
            "You Need to Install MetaMask";
        document.getElementById("connectButton").disabled = true;
    }
}

async function fund() {
    const amount = amountToFund.value.toString();
    console.log(`Funding with ${amount} ETH`);
    const ethAmount = ethers.utils.parseEther(amountToFund.value.toString());
    let connectedAccounts = await window.ethereum.request({
        method: "eth_accounts",
    });
    if (
        typeof window.ethereum !== "undefined" &&
        connectedAccounts.length > 0
    ) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethAmount,
            });
            // Listen for the tx to be mined
            // Listen for an event
            await listenFortransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("You need to install MetaMask or connect your wallet!");
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdrawMoney() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.cheaperWithdraw();
            await listenFortransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}

async function getOwner() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Getting Owner...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        console.log(contract);
        try {
            const transactionResponse = await contract.getPriceFeed();
            console.log(transactionResponse);
            await listenFortransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}

function listenFortransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
    return new Promise((resolve, reject) => {});
}
