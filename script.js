"use strict";
function init() {
  getProvider().then(provider => {
    console.log('key', provider.publicKey.toString())
  })
  .catch(function(error){
    console.log(error)
  });
}
const getProvider = async () => {
  if ("solana" in window) {
    
    await window.solana.connect(); // opens wallet to connect to

    const provider = window.solana;
    if (provider.isPhantom) {
      console.log("Is Phantom installed?  ", provider.isPhantom);
      return provider;
    }
  } else {
    document.write('Install https://www.phantom.app/');
  }
};

async function transferSOL() {
  const Sol = document.getElementById("SolVaue").value;
  // Detecing and storing the phantom wallet of the user (creator in this case)
  var provider = await getProvider();
  console.log("Public key of the emitter: ",provider.publicKey.toString());

  // Establishing connection
  var connection = new solanaWeb3.Connection('https://api.testnet.solana.com');

  // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever
  var recieverWallet = new solanaWeb3.PublicKey("JCS9uFqFcXmLUjKYZp8ZRGVicYawpCQWEGrahWVRucyk");

  // Airdrop some SOL to the sender's wallet, so that it can handle the txn fee
  var airdropSignature = await connection.requestAirdrop(
    provider.publicKey,
    solanaWeb3.LAMPORTS_PER_SOL,
  );

  // Confirming that the airdrop went through
  await connection.confirmTransaction(airdropSignature);
  console.log("Airdropped");

  var transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: recieverWallet,
      lamports: solanaWeb3.LAMPORTS_PER_SOL * Sol, //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
    }),
  );

  // Setting the variables for the transaction
  transaction.feePayer = await provider.publicKey;
  let blockhashObj = await connection.getRecentBlockhash();
  transaction.recentBlockhash = await blockhashObj.blockhash;

  // Transaction constructor initialized successfully
  if(transaction) {
    console.log("Txn created successfully");
  }
  
  // Request creator to sign the transaction (allow the transaction)
  let signed = await provider.signTransaction(transaction);
  // The signature is generated
  let signature = await connection.sendRawTransaction(signed.serialize());
  // Confirm whether the transaction went through or not
  await connection.confirmTransaction(signature);
  //Signature chhap diya idhar
  console.log("Signature: ", signature);
}
const sendSol = async () => {
  if ("solana" in window) {
    transferSOL();
  }
}
window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", getProvider);
  document.querySelector("#btn-sendEth").addEventListener("click", sendSol);
});