import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token không hợp lệ');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        // Get email from response if available
        if (response.data.email) {
          setEmail(response.data.email);
        }
        
        if (response.data.status === 'already_verified') {
          setStatus('already_verified');
          setMessage('Email đã được xác thực trước đó');
        } else {
          setStatus('success');
          setMessage(response.data.message || 'Email đã được xác thực thành công!');
          
          // Auto redirect to pending approval page after 3 seconds
          setTimeout(() => {
            navigate(`/pending-approval${response.data.email ? `?email=${encodeURIComponent(response.data.email)}` : ''}`);
          }, 3000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.detail || 'Có lỗi xảy ra khi xác thực email');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Đang xác thực...</h1>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Xác thực thành công! 🎉</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {/* Auto redirect notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-blue-700">
                  Đang chuyển đến trang chờ phê duyệt...
                </p>
              </div>
            </div>
            
            <Link 
              to={`/pending-approval${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="inline-block w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Tiếp tục →
            </Link>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Email đã xác thực</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <Link 
                to={`/pending-approval${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="inline-block w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Kiểm tra trạng thái phê duyệt
              </Link>
              <Link 
                to="/login" 
                className="inline-block w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Đăng nhập
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Xác thực thất bại</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <Link 
                to="/register" 
                className="inline-block w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                Đăng ký lại
              </Link>
              <Link 
                to="/login" 
                className="inline-block w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Đăng nhập
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
