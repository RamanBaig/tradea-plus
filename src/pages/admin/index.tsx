import { Link } from 'react-router-dom';
import { FileText, Key, MessageCircle } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="pt-24 px-8 pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IPN Logs Card */}
          <Link 
            to="/admin/ipn"
            className="glass-panel p-6 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Payment Logs</h3>
                <p className="text-sm text-gray-400">View IPN webhook logs</p>
              </div>
            </div>
          </Link>

          {/* API Keys Card */}
          <Link
            to="/admin/api-keys" 
            className="glass-panel p-6 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Key className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">API Keys</h3>
                <p className="text-sm text-gray-400">Manage API keys</p>
              </div>
            </div>
          </Link>

          {/* Support Messages Card */}
          <Link
            to="/admin/support-messages" 
            className="glass-panel p-6 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Support</h3>
                <p className="text-sm text-gray-400">View help messages</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};