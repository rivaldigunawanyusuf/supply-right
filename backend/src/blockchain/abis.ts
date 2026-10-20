export const MockETHAbi = [
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
] as const;

export const SupplyRightNFTAbi = [
  "function registrar() external view returns (address)",
  "function registerCommitment(address buyer, string calldata poId, uint256 totalValue, uint256 quantity, uint256 deadline) external returns (uint256 tokenId)",
  "function getCommitment(uint256 tokenId) external view returns (tuple(address buyer, string poId, uint256 totalValue, uint256 quantity, uint256 deadline, uint256 registeredAt, bool active))",
  "function isRegistered(string calldata poId) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event CommitmentRegistered(uint256 indexed tokenId, address indexed buyer, string poId, uint256 totalValue, uint256 quantity, uint256 deadline)"
] as const;

export const ProtectionVaultAbi = [
  "function provider() external view returns (address)",
  "function authorizedSettler() external view returns (address)",
  "function totalLocked() external view returns (uint256)",
  "function setAuthorizedSettler(address _settler) external",
  "function fundPolicy(uint256 commitmentTokenId, uint256 collateralAmount, uint256 coverageRateBps) external",
  "function releasePayout(uint256 commitmentTokenId, address buyer, uint256 amount) external",
  "function withdrawExcess(uint256 commitmentTokenId) external",
  "function getPolicy(uint256 commitmentTokenId) external view returns (tuple(uint256 commitmentTokenId, uint256 collateralAmount, uint256 coverageRateBps, uint256 maxPayout, uint256 fundedAt, bool active, bool settled))",
  "function isPolicyActive(uint256 commitmentTokenId) external view returns (bool)",
  "function getCollateral(uint256 commitmentTokenId) external view returns (uint256)",
  "event PolicyFunded(uint256 indexed commitmentTokenId, address indexed provider, uint256 collateralAmount, uint256 coverageRateBps, uint256 maxPayout)",
  "event PayoutReleased(uint256 indexed commitmentTokenId, address indexed buyer, uint256 amount)",
  "event ExcessWithdrawn(uint256 indexed commitmentTokenId, address indexed provider, uint256 amount)"
] as const;

export const RecoveryClaimNFTAbi = [
  "function claimManager() external view returns (address)",
  "function mintRecoveryClaim(address recipient, uint256 commitmentTokenId, uint256 payoutAmount, uint256 eligibleLoss, bytes32 evidenceHash) external returns (uint256 tokenId)",
  "function getRecoveryClaim(uint256 tokenId) external view returns (tuple(uint256 commitmentTokenId, address supplier, uint256 payoutAmount, uint256 eligibleLoss, uint256 mintedAt, bytes32 evidenceHash))",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event RecoveryClaimMinted(uint256 indexed tokenId, uint256 indexed commitmentTokenId, address indexed recipient, uint256 payoutAmount, uint256 eligibleLoss)"
] as const;

export const ClaimManagerAbi = [
  "function vault() external view returns (address)",
  "function recoveryNFT() external view returns (address)",
  "function commitmentNFT() external view returns (address)",
  "function verifier() external view returns (address)",
  "function agentWallet() external view returns (address)",
  "function submitClaim(uint256 commitmentTokenId, uint256 deliveredQuantity, bytes32 evidenceHash, bytes32 nonce) external",
  "function verifyClaim(uint256 commitmentTokenId, uint256 eligibleLoss, bool approved) external",
  "function settleWithPayout(uint256 commitmentTokenId) external",
  "function getClaim(uint256 commitmentTokenId) external view returns (tuple(uint256 commitmentTokenId, address buyer, uint256 deliveredQuantity, uint256 eligibleLoss, uint256 requestedPayout, bytes32 evidenceHash, uint8 status, uint256 submittedAt, uint256 settledAt, uint256 recoveryTokenId, bytes32 settlementTxHash))",
  "function isSettled(uint256 commitmentTokenId) external view returns (bool)",
  "function getClaimStatus(uint256 commitmentTokenId) external view returns (uint8)",
  "event ClaimSubmitted(uint256 indexed commitmentTokenId, address indexed buyer, uint256 deliveredQuantity, bytes32 evidenceHash)",
  "event ClaimVerified(uint256 indexed commitmentTokenId, address indexed verifier, uint256 eligibleLoss, bool approved)",
  "event SettlementExecuted(uint256 indexed commitmentTokenId, address indexed buyer, uint256 payoutAmount, uint256 recoveryTokenId, bytes32 evidenceHash)",
  "event ClaimRejected(uint256 indexed commitmentTokenId, string reason)"
] as const;
