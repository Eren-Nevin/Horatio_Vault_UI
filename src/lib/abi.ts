export const vaultAbi = [
	"function deposit(uint256 assets) external",
	"function withdraw(uint256 shares) external",
	"function previewWithdraw(uint256 shares) view returns (uint256)",
	"function previewDeposit(uint256 assets) view returns (uint256)",
	"function shares() view returns (address)",
];

export const erc20Abi = [
	"function approve(address spender, uint256 amount) external returns (bool)",
	"function allowance(address owner, address spender) view returns (uint256)",
	"function decimals() view returns (uint8)",
];

