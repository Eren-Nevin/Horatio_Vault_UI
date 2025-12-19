<script lang="ts">
	import { ethers } from "ethers";
	import { vaultAbi, erc20Abi } from "$lib/abi";

	const vaultAddress = "0x94775A95D1754C1A880cCf9F5AE765c7a61DA76D";
	const usdcAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

	let amount = "";
	let status = "";
	let mode: "deposit" | "withdraw" = "deposit";

	let provider: ethers.BrowserProvider | null = null;
	let signer: ethers.Signer | null = null;
	let vault: ethers.Contract | null = null;
	let usdc: ethers.Contract | null = null;
	let userAddress = "";

	async function connect() {
		try {
			provider = new ethers.BrowserProvider(window.ethereum);
			await provider.send("eth_requestAccounts", []);
			signer = await provider.getSigner();
			userAddress = await signer.getAddress();

			vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
			usdc = new ethers.Contract(usdcAddress, erc20Abi, signer);

			status = "Connected ✅";
		} catch (e) {
			console.error(e);
			status = "Connection failed ❌";
		}
	}

	async function handleAction() {
		if (!vault || !usdc || !signer) {
			status = "Connect wallet first ❌";
			return;
		}

		if (!amount || Number(amount) <= 0) {
			status = "Enter an amount";
			return;
		}

		try {
			if (mode === "deposit") {
				status = "Depositing...";

				const decimals = await usdc.decimals();
				const amt = ethers.parseUnits(amount, decimals);

				const allowance = await usdc.allowance(
					userAddress,
					vaultAddress,
				);
				if (allowance < amt) {
					status = "Approving USDC...";
					const tx1 = await usdc.approve(vaultAddress, amt);
					await tx1.wait();
				}

				status = "Calling deposit()...";
				const tx2 = await vault.deposit(amt);
				await tx2.wait();

				status = "Deposit successful ✅";
			}

			if (mode === "withdraw") {
				status = "Withdrawing...";

				const amt = ethers.parseUnits(amount, 18);
				const tx = await vault.withdraw(amt);
				await tx.wait();

				status = "Withdraw successful ✅";
			}
		} catch (err) {
			console.error(err);
			status = `${mode} failed ❌`;
		}
	}
</script>

<!-- PAGE LAYOUT (Centered Card) -->
<div
	class="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4"
>
	<div
		class="w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/60 shadow-xl"
	>
		<!-- Header Row -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex flex-col">
				<h1 class="text-xl font-semibold">Horatio Vault (Beta)</h1>
				<!-- <h1 class="text-xs font-medium">Trading AAVE</h1> -->
			</div>

			<button
				on:click={connect}
				class="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-sm"
			>
				{userAddress
					? userAddress.slice(0, 6) + "..." + userAddress.slice(-4)
					: "Connect Wallet"}
			</button>
		</div>

		<!-- Mode Toggle -->
		<div class="flex mb-6 bg-gray-700 rounded-xl overflow-hidden">
			<button
				class="flex-1 py-2 text-center transition"
				class:bg-gray-900={mode === "deposit"}
				on:click={() => (mode = "deposit")}
			>
				Deposit
			</button>
			<button
				class="flex-1 py-2 text-center transition"
				class:bg-gray-900={mode === "withdraw"}
				on:click={() => (mode = "withdraw")}
			>
				Withdraw
			</button>
		</div>

		<!-- Input Box -->
		<div class="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-700">
			<label class="text-sm text-gray-400"
				>{mode === "deposit"
					? "Amount (USDC)"
					: "Amount (Shares)"}</label
			>
			<input
				type="text"
				bind:value={amount}
				placeholder="0.00"
				class="w-full bg-transparent text-white text-2xl mt-1 focus:outline-none"
			/>
		</div>

		<!-- Main Action Button -->
		<button
			on:click={handleAction}
			class="w-full py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 transition"
		>
			{mode === "deposit" ? "Deposit USDC" : "Withdraw"}
		</button>

		<p class="text-gray-400 text-sm mt-4 min-h-[22px]">{status}</p>
	</div>
</div>
