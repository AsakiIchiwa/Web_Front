import { useState, useEffect } from 'react';
import { useWeb3 } from '../web3/Web3Context';
import { 
  Wallet, 
  Shield, 
  Award, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Zap,
  Star,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Web3Dashboard() {
  const {
    isConnected,
    isConnecting,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    getUserReputation,
    getUserOrders,
    getOrder,
  } = useWeb3();

  const [reputation, setReputation] = useState<any>(null);
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'certificates' | 'reputation'>('overview');

  // Load data when connected
  useEffect(() => {
    if (isConnected && account) {
      loadData();
    }
  }, [isConnected, account]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load reputation
      const rep = await getUserReputation();
      setReputation(rep);

      // Load orders
      const buyerOrderIds = await getUserOrders(true);
      const sellerOrderIds = await getUserOrders(false);

      const buyerOrdersData = await Promise.all(
        buyerOrderIds.slice(0, 5).map((id: number) => getOrder(id))
      );
      const sellerOrdersData = await Promise.all(
        sellerOrderIds.slice(0, 5).map((id: number) => getOrder(id))
      );

      setBuyerOrders(buyerOrdersData);
      setSellerOrders(sellerOrdersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Đã copy địa chỉ ví!');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number | null) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      31337: 'Localhost',
    };
    return networks[chainId || 0] || 'Unknown Network';
  };

  const getTierColor = (tier: number) => {
    const colors = [
      'from-amber-600 to-amber-800',     // Bronze
      'from-gray-400 to-gray-600',       // Silver
      'from-yellow-400 to-yellow-600',   // Gold
      'from-cyan-400 to-cyan-600',       // Platinum
      'from-purple-400 to-purple-600',   // Diamond
    ];
    return colors[tier] || colors[0];
  };

  const getStatusColor = (status: number) => {
    const colors = [
      'bg-gray-100 text-gray-800',       // Created
      'bg-blue-100 text-blue-800',       // Funded
      'bg-yellow-100 text-yellow-800',   // InProgress
      'bg-purple-100 text-purple-800',   // MilestoneComplete
      'bg-red-100 text-red-800',         // Disputed
      'bg-green-100 text-green-800',     // Completed
      'bg-gray-100 text-gray-800',       // Cancelled
      'bg-orange-100 text-orange-800',   // Refunded
    ];
    return colors[status] || colors[0];
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Web3 B2B Platform</h1>
              <p className="text-gray-400">Kết nối ví để trải nghiệm blockchain</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <Shield className="w-8 h-8 text-green-400 mb-2" />
                <h3 className="text-white font-semibold">Smart Contract Escrow</h3>
                <p className="text-gray-400 text-sm">Thanh toán an toàn</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <FileCheck className="w-8 h-8 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold">NFT Certificate</h3>
                <p className="text-gray-400 text-sm">Chứng nhận sản phẩm</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <Star className="w-8 h-8 text-yellow-400 mb-2" />
                <h3 className="text-white font-semibold">Reputation System</h3>
                <p className="text-gray-400 text-sm">Điểm uy tín on-chain</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
                <h3 className="text-white font-semibold">AI Price Suggest</h3>
                <p className="text-gray-400 text-sm">Gợi ý giá thông minh</p>
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-purple-500/30"
            >
              <Wallet className="w-6 h-6" />
              {isConnecting ? 'Đang kết nối...' : 'Kết nối MetaMask'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Yêu cầu MetaMask wallet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Web3 Dashboard</h1>
          </div>

          {/* Wallet Info */}
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">{getNetworkName(chainId)}</span>
            </div>
            
            <div className="bg-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className="text-white font-mono">{formatAddress(account || '')}</span>
              <button onClick={copyAddress} className="text-gray-400 hover:text-white">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl px-4 py-2">
              <span className="text-white font-bold">{parseFloat(balance).toFixed(4)} ETH</span>
            </div>

            <button
              onClick={disconnect}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/30 transition"
            >
              Ngắt kết nối
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          {[
            { key: 'overview', label: 'Tổng quan', icon: TrendingUp },
            { key: 'escrow', label: 'Escrow Orders', icon: Shield },
            { key: 'certificates', label: 'NFT Certificates', icon: FileCheck },
            { key: 'reputation', label: 'Reputation', icon: Award },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Reputation Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTierColor(reputation?.tier || 0)} flex items-center justify-center`}>
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{reputation?.tierName || 'Bronze'}</h3>
                      <p className="text-gray-400 text-sm">Reputation Tier</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {parseFloat(reputation?.reputation || '0').toFixed(0)} REP
                  </div>
                  <p className="text-green-400 text-sm">
                    -{reputation?.feeDiscount || 0}% phí giao dịch
                  </p>
                </div>

                {/* Transactions Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Giao dịch</h3>
                      <p className="text-gray-400 text-sm">Thành công</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {reputation?.successfulTransactions || 0}
                  </div>
                  <p className="text-gray-400 text-sm">
                    / {reputation?.totalTransactions || 0} tổng số
                  </p>
                </div>

                {/* Volume Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Volume</h3>
                      <p className="text-gray-400 text-sm">Tổng giao dịch</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {parseFloat(reputation?.totalVolumeTraded || '0').toFixed(2)} ETH
                  </div>
                </div>

                {/* Disputes Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Disputes</h3>
                      <p className="text-gray-400 text-sm">Tranh chấp</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{reputation?.disputesWon || 0}</div>
                      <p className="text-gray-400 text-sm">Thắng</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">{reputation?.disputesLost || 0}</div>
                      <p className="text-gray-400 text-sm">Thua</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Escrow Tab */}
            {activeTab === 'escrow' && (
              <div className="space-y-6">
                {/* Buyer Orders */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-400" />
                    Đơn hàng mua
                  </h2>
                  
                  {buyerOrders.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Chưa có đơn hàng nào</p>
                  ) : (
                    <div className="space-y-4">
                      {buyerOrders.map((order) => (
                        <div key={order.orderId} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">Order #{order.orderId}</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.statusName}
                              </span>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {order.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Seller</p>
                              <p className="text-white font-mono">{formatAddress(order.seller)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Total</p>
                              <p className="text-white font-bold">{order.totalAmount} ETH</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Progress</p>
                              <p className="text-white">{order.releasedAmount} / {order.totalAmount} ETH</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Orders */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-400" />
                    Đơn hàng bán
                  </h2>
                  
                  {sellerOrders.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Chưa có đơn hàng nào</p>
                  ) : (
                    <div className="space-y-4">
                      {sellerOrders.map((order) => (
                        <div key={order.orderId} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">Order #{order.orderId}</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.statusName}
                              </span>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {order.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Buyer</p>
                              <p className="text-white font-mono">{formatAddress(order.buyer)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Total</p>
                              <p className="text-white font-bold">{order.totalAmount} ETH</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Received</p>
                              <p className="text-green-400">{order.releasedAmount} ETH</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-purple-400" />
                  NFT Certificates
                </h2>
                <p className="text-gray-400 text-center py-8">
                  Tính năng NFT Certificate đang được phát triển...
                </p>
              </div>
            )}

            {/* Reputation Tab */}
            {activeTab === 'reputation' && reputation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tier Progress */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Reputation Tier</h2>
                  
                  <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${getTierColor(reputation.tier)} flex items-center justify-center`}>
                    <Award className="w-16 h-16 text-white" />
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-white">{reputation.tierName}</h3>
                    <p className="text-gray-400">{parseFloat(reputation.reputation).toFixed(0)} REP Tokens</p>
                  </div>

                  {/* Tier benefits */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Quyền lợi của bạn:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Giảm {reputation.feeDiscount}% phí giao dịch
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Badge {reputation.tierName} trên profile
                      </li>
                      {reputation.tier >= 2 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Ưu tiên hỗ trợ khách hàng
                        </li>
                      )}
                      {reputation.tier >= 3 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Early access tính năng mới
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Chi tiết thống kê</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Tổng giao dịch</span>
                      <span className="text-white font-bold">{reputation.totalTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Giao dịch thành công</span>
                      <span className="text-green-400 font-bold">{reputation.successfulTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Tỷ lệ thành công</span>
                      <span className="text-white font-bold">
                        {reputation.totalTransactions > 0 
                          ? ((reputation.successfulTransactions / reputation.totalTransactions) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Disputes thắng/thua</span>
                      <span className="text-white font-bold">
                        <span className="text-green-400">{reputation.disputesWon}</span>
                        {' / '}
                        <span className="text-red-400">{reputation.disputesLost}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Tổng volume</span>
                      <span className="text-white font-bold">{parseFloat(reputation.totalVolumeTraded).toFixed(4)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
