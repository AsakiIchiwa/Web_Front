import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Clock, CheckCircle, Mail, LogIn } from 'lucide-react';

export default function PendingApprovalPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<{
    email_verified: boolean;
    is_approved: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    if (!email) return;
    
    setChecking(true);
    try {
      const response = await api.get(`/auth/check-status?email=${encodeURIComponent(email)}`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Auto check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [email]);

  // If approved, show different UI
  if (status?.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🎉 Tài khoản đã được duyệt!</h1>
          <p className="text-gray-600 mb-6">
            Chúc mừng! Tài khoản của bạn đã được Admin phê duyệt. Bạn có thể đăng nhập ngay bây giờ.
          </p>
          
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-lg"
          >
            <LogIn className="w-5 h-5" />
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        
        {/* Waiting Animation */}
        <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center relative">
          <Clock className="w-12 h-12 text-amber-600" />
          <div className="absolute inset-0 rounded-full border-4 border-amber-300 border-t-amber-600 animate-spin"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chờ Admin phê duyệt</h1>
        <p className="text-gray-600 mb-6">
          Email của bạn đã được xác thực thành công! Tài khoản đang chờ Admin xem xét và phê duyệt.
        </p>
        
        {/* Progress Steps */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-4">📋 Tiến trình đăng ký</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <p className="font-medium text-gray-700">Đăng ký tài khoản</p>
                <p className="text-xs text-green-600">Hoàn thành</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <p className="font-medium text-gray-700">Xác thực email</p>
                <p className="text-xs text-green-600">Hoàn thành</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold animate-pulse">3</div>
              <div>
                <p className="font-medium text-gray-700">Admin phê duyệt</p>
                <p className="text-xs text-amber-600 font-medium">⏳ Đang chờ phê duyệt...</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium text-gray-400">Đăng nhập & sử dụng</p>
                <p className="text-xs text-gray-400">Chờ bước 3 hoàn thành</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Bạn sẽ nhận được email thông báo</p>
              <p className="text-xs text-blue-600 mt-1">
                Khi tài khoản được phê duyệt, chúng tôi sẽ gửi email thông báo đến {email || 'email của bạn'}.
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={checkStatus}
            disabled={checking}
            className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
          >
            {checking ? 'Đang kiểm tra...' : '🔄 Kiểm tra trạng thái'}
          </button>
          
          <Link 
            to="/login" 
            className="inline-block w-full py-3 px-6 text-gray-500 font-medium hover:text-gray-700 transition-all"
          >
            Quay lại đăng nhập
          </Link>
        </div>
        
        {/* Auto refresh note */}
        <p className="text-xs text-gray-400 mt-4">
          Trang này tự động kiểm tra mỗi 30 giây
        </p>

      </div>
    </div>
  );
}
