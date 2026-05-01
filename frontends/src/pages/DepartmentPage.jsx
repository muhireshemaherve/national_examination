import React, { useState } from 'react';
import axios from 'axios';

const DEPT_URL = "http://localhost:3000/api/departments";

export default function DepartmentPage({ departments, fetchDepartments }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    department_code: '',
    department_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${DEPT_URL}/${formData.department_code}`, formData);
      } else {
        await axios.post(DEPT_URL, formData);
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      alert("Error saving department. Make sure the code is unique.");
    }
  };

  const resetForm = () => {
    setFormData({ department_code: '', department_name: '' });
    setIsEditing(false);
  };

  const handleEdit = (dept) => {
    setFormData(dept);
    setIsEditing(true);
  };

  const handleDelete = async (code) => {
    if (window.confirm("Delete this department?")) {
      try {
        await axios.delete(`${DEPT_URL}/${code}`);
        fetchDepartments();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Registration Form */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? "📝 Edit Department" : "➕ Add New Department"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <input 
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            type="text" 
            placeholder="Dept Code (e.g., IT)" 
            value={formData.department_code} 
            onChange={e => setFormData({...formData, department_code: e.target.value})} 
            disabled={isEditing} 
            required 
          />
          <input 
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            type="text" 
            placeholder="Department Name" 
            value={formData.department_name} 
            onChange={e => setFormData({...formData, department_name: e.target.value})} 
            required 
          />
          <div className="flex gap-2">
            <button type="submit" className={`flex-1 font-bold text-white py-3 rounded-xl transition ${isEditing ? 'bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {isEditing ? "Update" : "Save Department"}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-5 bg-slate-100 rounded-xl">Cancel</button>
            )}
          </div>
        </form>
      </section>

      {/* Data Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Department Name</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.department_code} className="border-b hover:bg-slate-50 transition">
                <td className="p-4 font-bold text-slate-700">{dept.department_code}</td>
                <td className="p-4">{dept.department_name}</td>
                <td className="p-4 flex justify-center gap-4">
                  <button onClick={() => handleEdit(dept)} className="text-emerald-600 font-bold hover:underline">Edit</button>
                  <button onClick={() => handleDelete(dept.department_code)} className="text-red-600 font-bold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
