import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  Car, Wrench, FileText, CreditCard, Plus, 
  LogOut, Loader2, ChevronRight, Download, AlertCircle, FileSpreadsheet 
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

const DASHBOARD_CONFIG = {
  cars: { icon: Car, label: 'Vehicle Fleet', endpoint: '/cars/get' },
  services: { icon: Wrench, label: 'Service Types', endpoint: '/services/get' },
  records: { icon: FileText, label: 'Repair Records', endpoint: '/records/get' },
  reports: { icon: FileText, label: 'Service Reports', endpoint: '/reports/full-history', isReport: true },
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="font-sans antialiased text-slate-900">
      {!token ? (
        <Login onLoginSuccess={handleLogin} />
      ) : (
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

// --- LOGIN COMPONENT ---
const Login = ({ onLoginSuccess }) => {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/users/login`, creds);
      onLoginSuccess(data.token);
    } catch (err) {
      alert("Login failed. Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl mb-4 text-white">
            <Car size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">AUTOPRO</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full px-6 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500"
            onChange={e => setCreds({...creds, email: e.target.value})} 
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full px-6 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-blue-500"
            onChange={e => setCreds({...creds, password: e.target.value})} 
          />
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('cars');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}${DASHBOARD_CONFIG[activeTab].endpoint}`);
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownloadPDF = () => {
    if (!data.length) return alert("No data to export");
    const doc = new jsPDF();
    const headers = Object.keys(data[0]).map(h => h.toUpperCase().replace('_', ' '));
    const body = data.map(row => Object.values(row).map(v => v === null ? "" : String(v)));

    doc.text(`AutoPro ${DASHBOARD_CONFIG[activeTab].label}`, 14, 15);
    doc.autoTable({
      head: [headers],
      body: body,
      startY: 25,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });
    doc.save(`${activeTab}_report.pdf`);
  };

  // --- CSV DOWNLOAD LOGIC ---
  const handleDownloadCSV = () => {
    if (!data.length) return alert("No data to export");
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeTab}_report.csv`;
    link.click();
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-950 text-white flex flex-col p-6">
        <div className="px-4 py-8 text-2xl font-black tracking-tighter">AUTO<span className="text-blue-500">PRO</span></div>
        <nav className="flex-1 space-y-2">
          {Object.entries(DASHBOARD_CONFIG).map(([key, cfg]) => (
            <button 
              key={key} 
              onClick={() => setActiveTab(key)} 
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${activeTab === key ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <div className="flex items-center gap-4"><cfg.icon size={20} /> <span className="font-bold">{cfg.label}</span></div>
              {activeTab === key && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 p-4 text-slate-400 hover:text-white transition-colors mt-auto">
          <LogOut size={20} /> <span className="font-bold">Log Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900">{DASHBOARD_CONFIG[activeTab].label}</h2>
          <div className="flex gap-3">
            <button onClick={handleDownloadCSV} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
              <FileSpreadsheet size={18} className="text-green-600" /> CSV
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
              <Download size={18} /> PDF
            </button>
            {!DASHBOARD_CONFIG[activeTab].isReport && (
              <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                <Plus size={18} /> Add New
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center text-slate-400">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-medium">No records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{key.replace('_', ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-6 py-4 text-slate-600 font-medium">{val === null ? "N/A" : String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

