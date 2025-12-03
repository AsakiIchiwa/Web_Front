import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import toast from 'react-hot-toast';
import { Mail, RefreshCw } from 'lucide-react';

export default function RegisterSuccessPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Không tìm thấy email');
      return;
    }
    
    setResending(true);
    try {
      await api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
      toast.success('Đã gửi lại email xác thực!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Không thể gửi lại email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        
        {/* Email Animation */}
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center relative">
          <Mail className="w-12 h-12 text-blue-500" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-800">!</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Kiểm tra email của bạn</h1>
        <p className="text-gray-600 mb-2">
          Chúng tôi đã gửi email xác thực đến
        </p>
        <p className="text-lg font-semibold text-indigo-600 mb-6">{email || 'email của bạn'}</p>
        
        {/* Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm">📋</span>
            Quy trình đăng ký
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <p className="font-medium text-gray-700">Đăng ký tài khoản</p>
                <p className="text-xs text-gray-500">Hoàn thành</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold animate-pulse">2</div>
              <div>
                <p className="font-medium text-gray-700">Xác thực email</p>
                <p className="text-xs text-yellow-600 font-medium">⏳ Đang chờ bạn xác thực...</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-gray-400">Admin phê duyệt</p>
                <p className="text-xs text-gray-400">Chờ bước 2 hoàn thành</p>
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
        
        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-amber-800">
            <strong>💡 Lưu ý:</strong> Vui lòng kiểm tra cả thư mục <strong>Spam/Junk</strong> nếu không thấy email trong hộp thư đến.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={handleResendEmail}
            disabled={resending || !email}
            className="w-full py-3 px-6 border-2 border-indigo-500 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
          </button>
          
          <Link 
            to="/login" 
            className="inline-block w-full py-3 px-6 text-gray-500 font-medium hover:text-gray-700 transition-all"
          >
            Quay lại đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
