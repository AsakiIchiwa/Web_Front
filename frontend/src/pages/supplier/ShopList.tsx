import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, MessageCircle, Search, Loader2 } from 'lucide-react';
import { suppliersApi, chatApi } from '../api';
import toast from 'react-hot-toast';

interface Shop {
  id: number;
  shop_name: string;
  address?: string;
  phone?: string;
  user: {
    id: number;
    email: string;
    full_name?: string;
  };
}

export default function ShopList() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingChat, setCreatingChat] = useState<number | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredShops(shops);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = shops.filter(shop => 
        shop.shop_name?.toLowerCase().includes(query) ||
        shop.address?.toLowerCase().includes(query) ||
        shop.user.email?.toLowerCase().includes(query) ||
        shop.user.full_name?.toLowerCase().includes(query)
      );
      setFilteredShops(filtered);
    }
  }, [searchQuery, shops]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      // Call API to get all shops
      const response = await suppliersApi.searchShops();
      setShops(response.data);
      setFilteredShops(response.data);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      toast.error('Không thể tải danh sách shop');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (shopId: number) => {
    try {
      setCreatingChat(shopId);
      // Create or get chat room with this shop
      const response = await chatApi.createOrGetRoom(shopId);
      const roomId = response.data.id;
      // Navigate to chat page with this room
      navigate(`/supplier/chat/${roomId}`);
      toast.success('Đã mở chat');
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.response?.data?.detail || 'Không thể tạo chat');
    } finally {
      setCreatingChat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách Shop</h1>
        <p className="text-gray-600 mt-1">Tìm kiếm và liên hệ với các cửa hàng</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên shop, địa chỉ, email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng Shop</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{shops.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">{filteredShops.length}</div>
        </div>
      </div>

      {/* Shop list */}
      {filteredShops.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'Không tìm thấy shop phù hợp' : 'Chưa có shop nào trong hệ thống'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredShops.map(shop => (
            <div 
              key={shop.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Shop icon */}
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-7 h-7 text-blue-600" />
                  </div>

                  {/* Shop info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {shop.shop_name || 'Chưa đặt tên'}
                    </h3>
                    
                    {shop.user.full_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        Người đại diện: {shop.user.full_name}
                      </p>
                    )}

                    <div className="space-y-1">
                      {shop.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{shop.address}</span>
                        </div>
                      )}
                      {shop.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{shop.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{shop.user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleStartChat(shop.id)}
                    disabled={creatingChat === shop.id}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {creatingChat === shop.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang mở...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
