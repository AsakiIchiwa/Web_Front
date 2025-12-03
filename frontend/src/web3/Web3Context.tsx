import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Contract ABIs (simplified - full ABIs would be imported from artifacts)
const ESCROW_ABI = [
  "function createOrder(address _seller, string memory _productDetails, string[] memory _milestoneDescriptions, uint256[] memory _milestoneAmounts, uint256[] memory _milestoneDeadlines) external payable returns (uint256)",
  "function acceptOrder(uint256 _orderId) external",
  "function submitMilestone(uint256 _orderId, uint256 _milestoneIndex, string memory _deliveryProof) external",
  "function approveMilestone(uint256 _orderId, uint256 _milestoneIndex) external",
  "function rejectMilestone(uint256 _orderId, uint256 _milestoneIndex, string memory _reason) external",
  "function raiseDispute(uint256 _orderId, string memory _reason) external",
  "function cancelOrder(uint256 _orderId) external",
  "function getOrder(uint256 _orderId) external view returns (address buyer, address seller, uint256 totalAmount, uint256 depositedAmount, uint256 releasedAmount, uint8 status, uint256 createdAt, uint256 milestoneCount)",
  "function getMilestone(uint256 _orderId, uint256 _milestoneIndex) external view returns (string memory description, uint256 amount, uint256 deadline, uint8 status, string memory deliveryProof)",
  "function getUserOrders(address _user, bool _asBuyer) external view returns (uint256[] memory)",
  "function getUserReputation(address _user) external view returns (uint256 score, uint256 transactions)",
  "function orderCounter() external view returns (uint256)",
  "event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 totalAmount, uint256 milestoneCount)",
  "event MilestoneApproved(uint256 indexed orderId, uint256 milestoneIndex, uint256 amountReleased)",
  "event OrderCompleted(uint256 indexed orderId, uint256 totalReleased)",
];

const NFT_ABI = [
  "function mintCertificate(uint256 _productId, string memory _productName, string memory _origin, string memory _category, uint256 _manufactureDate, uint256 _expiryDate, string memory _batchNumber, string[] memory _qualityCertifications, string memory _ipfsMetadata, string memory _tokenURI) external returns (uint256)",
  "function getCertificate(uint256 _tokenId) external view returns (tuple(uint256 tokenId, uint256 productId, address supplier, string productName, string origin, string category, uint256 manufactureDate, uint256 expiryDate, string batchNumber, string[] qualityCertifications, string ipfsMetadata, bool isVerified, address verifiedBy, uint256 verifiedAt))",
  "function getSupplyChainHistory(uint256 _tokenId) external view returns (tuple(uint256 timestamp, string eventType, string location, string description, address recordedBy, string ipfsProof)[])",
  "function addSupplyChainEvent(uint256 _tokenId, string memory _eventType, string memory _location, string memory _description, string memory _ipfsProof) external",
  "function getCertificateByProductId(uint256 _productId) external view returns (tuple(uint256 tokenId, uint256 productId, address supplier, string productName, string origin, string category, uint256 manufactureDate, uint256 expiryDate, string batchNumber, string[] qualityCertifications, string ipfsMetadata, bool isVerified, address verifiedBy, uint256 verifiedAt))",
  "function isProductCertified(uint256 _productId) external view returns (bool)",
  "function verifiedSuppliers(address) external view returns (bool)",
  "function totalCertificates() external view returns (uint256)",
];

const REPUTATION_ABI = [
  "function getUserStats(address _user) external view returns (uint256 totalTransactions, uint256 successfulTransactions, uint256 disputesWon, uint256 disputesLost, uint256 totalVolumeTraded, uint256 reputation, uint8 tier, uint256 feeDiscount)",
  "function getUserTier(address _user) external view returns (uint8)",
  "function getFeeDiscount(address _user) external view returns (uint256)",
  "function getReputationScore(address _user) external view returns (uint256)",
  "function getTierName(uint8 _tier) external pure returns (string memory)",
  "function balanceOf(address account) external view returns (uint256)",
];

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: {
    escrow: '0x0000000000000000000000000000000000000000',
    nft: '0x0000000000000000000000000000000000000000',
    reputation: '0x0000000000000000000000000000000000000000',
  },
  // Polygon Mainnet
  137: {
    escrow: '0x0000000000000000000000000000000000000000',
    nft: '0x0000000000000000000000000000000000000000',
    reputation: '0x0000000000000000000000000000000000000000',
  },
  // Local Hardhat
  31337: {
    escrow: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    nft: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    reputation: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
};

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  balance: string;
  
  // Provider & Signer
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  
  // Contracts
  escrowContract: ethers.Contract | null;
  nftContract: ethers.Contract | null;
  reputationContract: ethers.Contract | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Escrow functions
  createEscrowOrder: (params: CreateOrderParams) => Promise<number>;
  acceptOrder: (orderId: number) => Promise<void>;
  submitMilestone: (orderId: number, milestoneIndex: number, proof: string) => Promise<void>;
  approveMilestone: (orderId: number, milestoneIndex: number) => Promise<void>;
  getOrder: (orderId: number) => Promise<EscrowOrder>;
  getUserOrders: (asBuyer: boolean) => Promise<number[]>;
  
  // NFT functions
  mintCertificate: (params: MintCertificateParams) => Promise<number>;
  getCertificate: (tokenId: number) => Promise<Certificate>;
  getSupplyChainHistory: (tokenId: number) => Promise<SupplyChainEvent[]>;
  
  // Reputation functions
  getUserReputation: (address?: string) => Promise<UserReputation>;
}

interface CreateOrderParams {
  seller: string;
  productDetails: string;
  milestones: {
    description: string;
    amount: string; // in ETH
    deadline: number; // Unix timestamp
  }[];
}

interface MintCertificateParams {
  productId: number;
  productName: string;
  origin: string;
  category: string;
  manufactureDate: number;
  expiryDate: number;
  batchNumber: string;
  qualityCertifications: string[];
  ipfsMetadata: string;
  tokenURI: string;
}

interface EscrowOrder {
  orderId: number;
  buyer: string;
  seller: string;
  totalAmount: string;
  depositedAmount: string;
  releasedAmount: string;
  status: number;
  statusName: string;
  createdAt: Date;
  milestoneCount: number;
  milestones: Milestone[];
}

interface Milestone {
  description: string;
  amount: string;
  deadline: Date;
  status: number;
  statusName: string;
  deliveryProof: string;
}

interface Certificate {
  tokenId: number;
  productId: number;
  supplier: string;
  productName: string;
  origin: string;
  category: string;
  manufactureDate: Date;
  expiryDate: Date | null;
  batchNumber: string;
  qualityCertifications: string[];
  ipfsMetadata: string;
  isVerified: boolean;
  verifiedBy: string;
  verifiedAt: Date | null;
}

interface SupplyChainEvent {
  timestamp: Date;
  eventType: string;
  location: string;
  description: string;
  recordedBy: string;
  ipfsProof: string;
}

interface UserReputation {
  totalTransactions: number;
  successfulTransactions: number;
  disputesWon: number;
  disputesLost: number;
  totalVolumeTraded: string;
  reputation: string;
  tier: number;
  tierName: string;
  feeDiscount: number;
}

const ORDER_STATUS = ['Created', 'Funded', 'InProgress', 'MilestoneComplete', 'Disputed', 'Completed', 'Cancelled', 'Refunded'];
const MILESTONE_STATUS = ['Pending', 'InProgress', 'Submitted', 'Approved', 'Rejected'];
const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [escrowContract, setEscrowContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);
  const [reputationContract, setReputationContract] = useState<ethers.Contract | null>(null);

  // Initialize contracts
  const initContracts = useCallback(async (signer: ethers.Signer, chainId: number) => {
    const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    if (!addresses) {
      console.warn('No contract addresses for chain', chainId);
      return;
    }

    try {
      const escrow = new ethers.Contract(addresses.escrow, ESCROW_ABI, signer);
      const nft = new ethers.Contract(addresses.nft, NFT_ABI, signer);
      const reputation = new ethers.Contract(addresses.reputation, REPUTATION_ABI, signer);

      setEscrowContract(escrow);
      setNftContract(nft);
      setReputationContract(reputation);
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }, []);

  // Connect wallet
  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      const userSigner = await browserProvider.getSigner();
      const userBalance = await browserProvider.getBalance(accounts[0]);

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(userBalance));
      setIsConnected(true);

      await initContracts(userSigner, Number(network.chainId));
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setProvider(null);
    setSigner(null);
    setEscrowContract(null);
    setNftContract(null);
    setReputationContract(null);
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        // Add network configuration here
      }
    }
  };

  // Create escrow order
  const createEscrowOrder = async (params: CreateOrderParams): Promise<number> => {
    if (!escrowContract || !signer) throw new Error('Not connected');

    const descriptions = params.milestones.map(m => m.description);
    const amounts = params.milestones.map(m => ethers.parseEther(m.amount));
    const deadlines = params.milestones.map(m => m.deadline);
    const totalAmount = amounts.reduce((a, b) => a + b, BigInt(0));

    const tx = await escrowContract.createOrder(
      params.seller,
      params.productDetails,
      descriptions,
      amounts,
      deadlines,
      { value: totalAmount }
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'OrderCreated');
    return Number(event?.args?.orderId || 0);
  };

  // Accept order
  const acceptOrder = async (orderId: number) => {
    if (!escrowContract) throw new Error('Not connected');
    const tx = await escrowContract.acceptOrder(orderId);
    await tx.wait();
  };

  // Submit milestone
  const submitMilestone = async (orderId: number, milestoneIndex: number, proof: string) => {
    if (!escrowContract) throw new Error('Not connected');
    const tx = await escrowContract.submitMilestone(orderId, milestoneIndex, proof);
    await tx.wait();
  };

  // Approve milestone
  const approveMilestone = async (orderId: number, milestoneIndex: number) => {
    if (!escrowContract) throw new Error('Not connected');
    const tx = await escrowContract.approveMilestone(orderId, milestoneIndex);
    await tx.wait();
  };

  // Get order details
  const getOrder = async (orderId: number): Promise<EscrowOrder> => {
    if (!escrowContract) throw new Error('Not connected');

    const order = await escrowContract.getOrder(orderId);
    const milestones: Milestone[] = [];

    for (let i = 0; i < Number(order.milestoneCount); i++) {
      const m = await escrowContract.getMilestone(orderId, i);
      milestones.push({
        description: m.description,
        amount: ethers.formatEther(m.amount),
        deadline: new Date(Number(m.deadline) * 1000),
        status: Number(m.status),
        statusName: MILESTONE_STATUS[Number(m.status)],
        deliveryProof: m.deliveryProof,
      });
    }

    return {
      orderId,
      buyer: order.buyer,
      seller: order.seller,
      totalAmount: ethers.formatEther(order.totalAmount),
      depositedAmount: ethers.formatEther(order.depositedAmount),
      releasedAmount: ethers.formatEther(order.releasedAmount),
      status: Number(order.status),
      statusName: ORDER_STATUS[Number(order.status)],
      createdAt: new Date(Number(order.createdAt) * 1000),
      milestoneCount: Number(order.milestoneCount),
      milestones,
    };
  };

  // Get user orders
  const getUserOrders = async (asBuyer: boolean): Promise<number[]> => {
    if (!escrowContract || !account) throw new Error('Not connected');
    const orders = await escrowContract.getUserOrders(account, asBuyer);
    return orders.map((o: bigint) => Number(o));
  };

  // Mint NFT certificate
  const mintCertificate = async (params: MintCertificateParams): Promise<number> => {
    if (!nftContract) throw new Error('Not connected');

    const tx = await nftContract.mintCertificate(
      params.productId,
      params.productName,
      params.origin,
      params.category,
      params.manufactureDate,
      params.expiryDate,
      params.batchNumber,
      params.qualityCertifications,
      params.ipfsMetadata,
      params.tokenURI
    );

    const receipt = await tx.wait();
    // Parse event to get token ID
    return 0; // TODO: Parse from event
  };

  // Get certificate
  const getCertificate = async (tokenId: number): Promise<Certificate> => {
    if (!nftContract) throw new Error('Not connected');
    const cert = await nftContract.getCertificate(tokenId);
    
    return {
      tokenId: Number(cert.tokenId),
      productId: Number(cert.productId),
      supplier: cert.supplier,
      productName: cert.productName,
      origin: cert.origin,
      category: cert.category,
      manufactureDate: new Date(Number(cert.manufactureDate) * 1000),
      expiryDate: cert.expiryDate > 0 ? new Date(Number(cert.expiryDate) * 1000) : null,
      batchNumber: cert.batchNumber,
      qualityCertifications: cert.qualityCertifications,
      ipfsMetadata: cert.ipfsMetadata,
      isVerified: cert.isVerified,
      verifiedBy: cert.verifiedBy,
      verifiedAt: cert.verifiedAt > 0 ? new Date(Number(cert.verifiedAt) * 1000) : null,
    };
  };

  // Get supply chain history
  const getSupplyChainHistory = async (tokenId: number): Promise<SupplyChainEvent[]> => {
    if (!nftContract) throw new Error('Not connected');
    const history = await nftContract.getSupplyChainHistory(tokenId);
    
    return history.map((event: any) => ({
      timestamp: new Date(Number(event.timestamp) * 1000),
      eventType: event.eventType,
      location: event.location,
      description: event.description,
      recordedBy: event.recordedBy,
      ipfsProof: event.ipfsProof,
    }));
  };

  // Get user reputation
  const getUserReputation = async (address?: string): Promise<UserReputation> => {
    if (!reputationContract) throw new Error('Not connected');
    const userAddress = address || account;
    if (!userAddress) throw new Error('No address');

    const stats = await reputationContract.getUserStats(userAddress);
    
    return {
      totalTransactions: Number(stats.totalTransactions),
      successfulTransactions: Number(stats.successfulTransactions),
      disputesWon: Number(stats.disputesWon),
      disputesLost: Number(stats.disputesLost),
      totalVolumeTraded: ethers.formatEther(stats.totalVolumeTraded),
      reputation: ethers.formatEther(stats.reputation),
      tier: Number(stats.tier),
      tierName: TIER_NAMES[Number(stats.tier)],
      feeDiscount: Number(stats.feeDiscount) / 100, // Convert basis points to percent
    };
  };

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(parseInt(chainId, 16));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        isConnecting,
        account,
        chainId,
        balance,
        provider,
        signer,
        escrowContract,
        nftContract,
        reputationContract,
        connect,
        disconnect,
        switchNetwork,
        createEscrowOrder,
        acceptOrder,
        submitMilestone,
        approveMilestone,
        getOrder,
        getUserOrders,
        mintCertificate,
        getCertificate,
        getSupplyChainHistory,
        getUserReputation,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export default Web3Context;
