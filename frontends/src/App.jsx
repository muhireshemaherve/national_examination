import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Car, Wrench, FileText, CreditCard, 
  Trash2, Plus, Edit, Search, X, LogOut, Loader2
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

// --- LOGIN COMPONENT ---
const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/users/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Car size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AUTOPRO</h2>
          <p className="text-slate-500 font-medium">Service Management Portal</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full mt-1 p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="admin@autopro.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
            <input 
              type="password" 
              className="w-full mt-1 p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transform transition active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = ({ token, setToken }) => {
  const [activeTab, setActiveTab] = useState('cars');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const config = {
    cars: { icon: <Car size={20}/>, label: 'Vehicle Fleet', endpoint: '/cars/get', delete: '/cars/delete/' },
    services: { icon: <Wrench size={20}/>, label: 'Service Types', endpoint: '/services/get', delete: '/services/delete/' },
    records: { icon: <FileText size={20}/>, label: 'Repair Records', endpoint: '/records/get', delete: '/records/delete/' },
    payments: { icon: <CreditCard size={20}/>, label: 'Transactions', endpoint: '/records/get', delete: '/payments/delete/' },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Note: Backend might need headers: { Authorization: `Bearer ${token}` } if middleware is active
      const res = await axios.get(`${API_BASE}${config[activeTab].endpoint}`);
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const handleDelete = async (row) => {
    const id = Object.values(row)[0]; // Assumes first column is the primary key (ID)
    if (!window.confirm(`Are you sure you want to delete ID: ${id}?`)) return;
    try {
      await axios.delete(`${API_BASE}${config[activeTab].delete}${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed. This item might be linked to other records.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-8 flex items-center gap-3 text-2xl font-black border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><Car size={24} /></div>
          <span>AUTO<span className="text-blue-500">PRO</span></span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {Object.entries(config).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === key ? 'bg-blue-600 shadow-lg' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {item.icon} <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 w-full transition">
            <LogOut size={20} /> <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b px-8 flex items-center justify-between shadow-sm">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold">AD</div>
            <span className="font-bold text-sm">Administrator</span>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h1>
              <p className="text-slate-500">Manage and monitor your automotive service data.</p>
            </div>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition shadow-lg shadow-slate-200">
              <Plus size={20} /> Add {activeTab.slice(0, -1)}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center gap-4 text-slate-400">
                <Loader2 className="animate-spin" size={40} />
                <p className="font-medium">Fetching Records...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {data.length > 0 && Object.keys(data[0]).map((key) => (
                      <th key={key} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                        {key.replace('_', ' ')}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())).map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-6 py-4 text-sm font-medium text-slate-600">{val || "-"}</td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(row)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- APP ENTRY POINT ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <>
      {token ? (
        <Dashboard token={token} setToken={setToken} />
      ) : (
        <Login setToken={setToken} />
      )}
    </>
  );
}
