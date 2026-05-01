import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// Import Recharts components
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const API_URL = "http://localhost:3000/api/employee";

function Register() { // Renamed to PascalCase (Register) as per React convention
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee_number: '', first_name: '', last_name: '', addres: '',
    position: '', telephone: '', gender: 'Male', hired_date: '', department_code: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_URL);
      setEmployees(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // --- DATA TRANSFORMATION FOR CHART ---
  // This calculates how many employees are in each department
  const chartData = useMemo(() => {
    const counts = employees.reduce((acc, emp) => {
      const dept = emp.department_code || "N/A";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(dept => ({
      name: dept,
      count: counts[dept]
    }));
  }, [employees]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${formData.employee_number}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      alert("Error saving record");
    }
  };

  const resetForm = () => {
    setFormData({ 
      employee_number: '', first_name: '', last_name: '', addres: '', 
      position: '', telephone: '', gender: 'Male', hired_date: '', department_code: '' 
    });
    setIsEditing(false);
  };

  const handleEdit = (emp) => {
    setFormData(emp);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchEmployees();
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex w-full min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 text-2xl font-bold border-b border-slate-700">🚀 AdminPro</div>
        <nav className="flex-1 p-4 space-y-2 text-slate-300">
          <div className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer">Employees</div>
          <div className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition">Departments</div>
          <div className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition">Salary</div>
          <div className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition">Settings</div>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full bg-slate-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium uppercase text-slate-500 tracking-wider">Muhire Dashboard</span>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-slate-500 text-sm font-bold uppercase">Total Employees</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <p className="text-slate-500 text-sm font-bold uppercase">Departments</p>
              <p className="text-3xl font-bold">{chartData.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
              <p className="text-slate-500 text-sm font-bold uppercase">Active Users</p>
              <p className="text-3xl font-bold">Live</p>
            </div>
          </div>

          {/* --- NEW CHART SECTION --- */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4">Department Distribution</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 3. REGISTRATION FORM */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              {isEditing ? "📝 Edit Employee" : "➕ Add New Employee"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border-slate-200 border p-3 rounded-lg focus:border-blue-500 outline-none transition" type="text" placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
              <input className="border-slate-200 border p-3 rounded-lg focus:border-blue-500 outline-none transition" type="text" placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
              <input className="border-slate-200 border p-3 rounded-lg focus:border-blue-500 outline-none transition" type="text" placeholder="Position" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
              <input className="border-slate-200 border p-3 rounded-lg focus:border-blue-500 outline-none transition" type="text" placeholder="Dept Code (e.g. IT, HR)" value={formData.department_code} onChange={e => setFormData({...formData, department_code: e.target.value})} />
              <select className="border-slate-200 border p-3 rounded-lg bg-white outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className={`flex-1 font-bold text-white py-3 rounded-lg transition shadow-lg ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                  {isEditing ? "Update" : "Save Employee"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="px-4 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition">Cancel</button>
                )}
              </div>
            </form>
          </section>

          {/* 4. DATA TABLE */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              Employee Directory
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Employee ID</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Dept</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.employee_number} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{emp.employee_number}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{emp.first_name} {emp.last_name}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{emp.position}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{emp.department_code}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:underline font-medium text-sm">Edit</button>
                        <button onClick={() => handleDelete(emp.employee_number)} className="text-red-500 hover:underline font-medium text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Register;