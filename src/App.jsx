import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, FileText, User, Settings, LogOut, Download, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CutMindApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Real-time application form state
  const [formData, setFormData] = useState({
    paperWidth: 1000,
    paperHeight: 700,
    paperThickness: 0.2,
    pieceWidth: 200,
    pieceHeight: 150,
    quantity: 20,
    allowRotation: true,
    margin: 5
  });

  // Optimization Result State
  const [resultData, setResultData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const runOptimization = () => {
    // Real calculation logic based on user inputs
    const sheetArea = formData.paperWidth * formData.paperHeight;
    const pieceArea = formData.pieceWidth * formData.pieceHeight;
    const maxPossiblePieces = Math.floor(sheetArea / pieceArea);
    const totalPiecesNeeded = formData.quantity;
    
    const placedPieces = Math.min(totalPiecesNeeded, maxPossiblePieces);
    const usedArea = placedPieces * pieceArea;
    const materialUsedPct = Math.min(100, Number(((usedArea / sheetArea) * 100).toFixed(1)));
    const wastePct = Number((100 - materialUsedPct).toFixed(1));

    setResultData({
      ...formData,
      totalPieces: placedPieces,
      materialUsed: materialUsedPct,
      waste: wastePct,
      efficiency: materialUsedPct
    });

    setActiveTab('result');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg text-black font-bold">✂️</div>
            <span className="text-xl font-bold tracking-wide text-white">CutMind <span className="text-emerald-400">AI</span></span>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<PlusCircle size={18} />} label="New Optimization" active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
            <SidebarItem icon={<FileText size={18} />} label="Optimization Result" active={activeTab === 'result'} onClick={() => setActiveTab('result')} />
            <SidebarItem icon={<FileText size={18} />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <SidebarItem icon={<User size={18} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <SidebarItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </div>

        <div>
          <SidebarItem 
            icon={<LogOut size={18} />} 
            label="Logout" 
            active={false} 
            onClick={() => alert("Logged out successfully! Redirecting to login...")} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'new' && <NewOptimizationView formData={formData} handleInputChange={handleInputChange} runOptimization={runOptimization} />}
        {activeTab === 'result' && <ResultView resultData={resultData} setActiveTab={setActiveTab} />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ setActiveTab }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, Ace! AI Paper Cutting Optimization System</p>
        </div>
        <button 
          onClick={() => setActiveTab('new')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          <PlusCircle size={16} /> New Optimization
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total Orders" value="25" />
        <MetricCard title="Paper Used" value="1250 m²" />
        <MetricCard title="Paper Saved" value="185 m²" />
        <MetricCard title="Waste Percentage" value="12.8%" sub="Optimized by AI" positive />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Optimizations & Manufacturing Efficiency</h3>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="border-b border-gray-800 text-gray-400">
            <tr>
              <th className="pb-3">ID</th>
              <th className="pb-3">Paper Size (mm)</th>
              <th className="pb-3">Pieces</th>
              <th className="pb-3">Waste %</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <tr>
              <td className="py-3 font-medium text-white">#25</td>
              <td className="py-3">1000 x 700</td>
              <td className="py-3">20</td>
              <td className="py-3 text-emerald-400">5.2%</td>
              <td className="py-3">03 May 2024</td>
              <td className="py-3">
                <button onClick={() => setActiveTab('result')} className="text-emerald-400 hover:underline flex items-center gap-1 text-xs font-semibold">
                  View <ArrowRight size={14} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, positive }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-xs text-gray-400 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2 text-white">{value}</p>
      {sub && <p className={`text-xs mt-2 ${positive ? 'text-emerald-400' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  );
}

function NewOptimizationView({ formData, handleInputChange, runOptimization }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Optimization</h1>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-400">Paper Details</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Width (mm)</label>
            <input type="number" name="paperWidth" value={formData.paperWidth} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Height (mm)</label>
            <input type="number" name="paperHeight" value={formData.paperHeight} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Thickness (mm)</label>
            <input type="number" name="paperThickness" value={formData.paperThickness} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-400">Piece Details</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Piece Width (mm)</label>
            <input type="number" name="pieceWidth" value={formData.pieceWidth} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Piece Height (mm)</label>
            <input type="number" name="pieceHeight" value={formData.pieceHeight} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Quantity (Pieces)</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-400">Options & Eco-Settings</h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">Allow Rotation</span>
            <input type="checkbox" name="allowRotation" checked={formData.allowRotation} onChange={handleInputChange} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">Cutting Margin (mm)</span>
            <input type="number" name="margin" value={formData.margin} onChange={handleInputChange} className="w-20 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1 text-white text-center focus:outline-none focus:border-emerald-500" />
          </div>
          <button 
            onClick={runOptimization}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            Optimize Now ✨
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultView({ resultData, setActiveTab }) {
  const data = resultData || {
    paperWidth: 1000, paperHeight: 700, totalPieces: 20, materialUsed: 95.0, waste: 5.0, efficiency: 95.0
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Optimization Result</h1>
          <p className="text-gray-400 text-sm">Showing calculated layout for sheet size: {data.paperWidth}mm x {data.paperHeight}mm</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('new')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold text-sm">
            Modify Inputs
          </button>
          <button onClick={() => alert("Downloading PDF Report...")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-emerald-400">AI Layout Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400">Total Pieces Placed</p>
              <p className="text-2xl font-bold text-white mt-1">{data.totalPieces}</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400">Material Utilization</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{data.materialUsed}%</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400">Waste Percentage</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{data.waste}%</p>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400">Cutting Efficiency</p>
              <p className="text-2xl font-bold text-white mt-1">{data.efficiency}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-emerald-400 mb-4">Cutting Layout Preview</h3>
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 grid grid-cols-5 gap-2 h-60 items-center text-center overflow-y-auto">
            {[...Array(Number(data.totalPieces) || 1)].map((_, i) => (
              <div key={i} className="bg-emerald-600/30 border border-emerald-400 text-emerald-200 text-xs font-semibold py-3 rounded">
                Piece {i + 1}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-600 inline-block rounded"></span> Usable Area</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-950 border border-red-500 inline-block rounded"></span> Eco-Waste Area ({data.waste}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports Archive</h1>
      <p className="text-gray-400 text-sm">Review historical manufacturing optimization logs and eco-savings reports.</p>
      <div className="space-y-3">
        {['#25 - 03 May 2024 (5.2% Waste)', '#24 - 02 May 2024 (8.7% Waste)', '#23 - 01 May 2024 (6.1% Waste)'].map((report, idx) => (
          <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
            <span className="font-semibold text-white">Optimization Report {report}</span>
            <button onClick={() => alert(`Downloading report ${report}`)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer">
              <Download size={14} /> Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Full Name</label>
          <input type="text" defaultValue="Ace User" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Email Address</label>
          <input type="email" defaultValue="ace@cutmindai.com" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Manufacturing Unit / Organization</label>
          <input type="text" defaultValue="AR Electro Projects & Paper Units" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <button onClick={() => alert("Profile updated successfully!")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold text-sm cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <div>
            <p className="font-semibold text-white">AI Auto-Optimization Engine</p>
            <p className="text-xs text-gray-400">Automatically recalculate waste reduction heuristics on input changes.</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 cursor-pointer" />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <div>
            <p className="font-semibold text-white">Eco-Friendly Manufacturing Mode</p>
            <p className="text-xs text-gray-400">Prioritize minimal carbon footprint and material savings.</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 cursor-pointer" />
        </div>
        <button onClick={() => alert("Settings saved successfully!")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold text-sm cursor-pointer">
          Update Settings
        </button>
      </div>
    </div>
  );
}
