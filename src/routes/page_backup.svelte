<script lang="ts">
	import { ethers } from "ethers";
	import { vaultAbi, erc20Abi } from "$lib/abi";

	const vaultAddress = "0x94775A95D1754C1A880cCf9F5AE765c7a61DA76D";
	const usdcAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

	// const vaultAddress = import.meta.env.PUBLIC_VAULT_ADDRESS;
	// const usdcAddress = import.meta.env.PUBLIC_USDC_ADDRESS;

	console.log("env", import.meta.env);
	console.log("vault", import.meta.env.PUBLIC_VAULT_ADDRESS);
	console.log("usdc", import.meta.env.PUBLIC_USDC_ADDRESS);

	let amount = "1";
	let status = "";

	let provider: ethers.BrowserProvider | null = null;
	let signer: ethers.Signer | null = null;
	let vault: ethers.Contract | null = null;
	let usdc: ethers.Contract | null = null;

	if (!vaultAddress || !usdcAddress) {
		console.error("Env variables missing!", { vaultAddress, usdcAddress });
	}

	// console.log("vaultAddress =", vaultAddress);
	// console.log("usdcAddress =", usdcAddress);

	async function connect() {
		try {
			provider = new ethers.BrowserProvider(window.ethereum);
			await provider.send("eth_requestAccounts", []);
			signer = await provider.getSigner();

			vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
			usdc = new ethers.Contract(usdcAddress, erc20Abi, signer);

			status = "Connected ✅";
		} catch (err) {
			console.error(err);
			status = "Connection failed ❌";
		}
	}

	async function deposit() {
		if (!signer || !usdc || !vault) {
			status = "Connect wallet first ❌";
			return;
		}

		try {
			status = "Depositing...";

			const decimals = await usdc.decimals();
			const amt = ethers.parseUnits(amount, decimals);

			const user = await signer.getAddress();
			const allowance = await usdc.allowance(user, vaultAddress);

			if (allowance < amt) {
				status = "Approving USDC...";
				const tx1 = await usdc.approve(vaultAddress, amt);
				await tx1.wait();
			}

			status = "Calling deposit()...";
			const tx2 = await vault.deposit(amt);
			await tx2.wait();

			status = "Deposit successful ✅";
		} catch (err) {
			console.error(err);
			status = "Deposit failed ❌";
		}
	}

	async function withdraw() {
		if (!signer || !vault) {
			status = "Connect wallet first ❌";
			return;
		}

		try {
			status = "Withdrawing...";

			const amt = ethers.parseUnits(amount, 18); // shares are always 18 decimals
			const tx = await vault.withdraw(amt);
			await tx.wait();

			status = "Withdraw successful ✅";
		} catch (err) {
			console.error(err);
			status = "Withdraw failed ❌";
		}
	}
</script>

<!-- VERY SIMPLE UI -->
<div
	style="max-width: 380px; margin: 50px auto; padding: 20px; font-family: sans-serif;"
>
	<button on:click={connect}>Connect Wallet</button>

	<h3>Vault Interaction</h3>

	<input
		type="text"
		bind:value={amount}
		placeholder="Amount (USDC or Shares)"
		style="width:100%; padding:8px; margin-bottom:10px;"
	/>

	<button on:click={deposit} style="width:100%; margin-bottom:10px;">
		Deposit
	</button>

	<button on:click={withdraw} style="width:100%;"> Withdraw </button>

	<p style="margin-top:20px; color:gray;">{status}</p>
</div>
