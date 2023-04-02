window.onload = function(){
	document.getElementById("balanceBtn").onclick = async() => {
		if (typeof window.ethereum !== 'undefined') {
		    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
			const currentAccount = accounts[0];
			const contract = ConnectContract();
			console.log(contract)
			var userInput = prompt(Guess a number);
			consloe.log(userInput)
		} else{
			alert("Install MetaMask or connect a provider");
		}
	};

	function HexToWei(hexBalance){
		return parseInt(hexBalance, 16);
	}
}

async function ConnectContract(){
	const GAME_CONTRACT_ADDRESS = "0x025747E11a5a0D70DA67c1F625BD442d13474363";
	const GAME_CONTRACT_ABI = fetch('./game_abi.json');

	const provider = new Provider("https://zksync2-testnet.zksync.dev");
  	const signer = new Web3Provider(window.ethereum).getSigner();
  	return contract = new Contract(
    	GAME_CONTRACT_ADDRESS,
    	GAME_CONTRACT_ABI,
    	signer
  	);
}