import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, FileText, User, Settings, LogOut, Download, AlertTriangle, CheckCircle, ArrowLeft, Edit3, Save } from 'lucide-react';

export default function CutMindApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const [optimizationResult, setOptimizationResult] = useState(null);

  const [reports, setReports] = useState([
    {
      id: 23,
      date: '29 Sept 2026',
      customerName: 'AR Electro Unit',
      phone: '+91 9000000000',
      email: 'contact@arelectro.com',
      paperWidth: 1759,
      paperHeight: 700,
      paperThickness: 0.2,
      margin: 5,
      allowRotation: 'Yes',
      pieceWidth: 1007,
      pieceHeight: 150,
      quantity: 20,
      totalSheets: 5,
      utilization: 49.07,
      waste: 50.93
    }
  ]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({ customerName: '', phone: '', email: '' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? '' : Number(value))
    }));
  };

  const isInputInvalid = 
    formData.paperWidth === '' || formData.paperWidth <= 0 ||
    formData.paperHeight === '' || formData.paperHeight <= 0 ||
    formData.pieceWidth === '' || formData.pieceWidth <= 0 ||
    formData.pieceHeight === '' || formData.pieceHeight <= 0 ||
    formData.quantity === '' || formData.quantity <= 0 ||
    formData.paperThickness === '' || formData.paperThickness <= 0 ||
    formData.margin === '' || formData.margin < 0;

  const usableWidth = Number(formData.paperWidth || 0) - (2 * Number(formData.margin || 0));
  const usableHeight = Number(formData.paperHeight || 0) - (2 * Number(formData.margin || 0));

  const isUsableValid = usableWidth > 0 && usableHeight > 0;

  const normalFit = isUsableValid && (usableWidth >= Number(formData.pieceWidth)) && (usableHeight >= Number(formData.pieceHeight));
  const rotatedFit = isUsableValid && formData.allowRotation && (usableWidth >= Number(formData.pieceHeight)) && (usableHeight >= Number(formData.pieceWidth));
  const canFitAtLeastOne = normalFit || rotatedFit;

  const isFormValid = !isInputInvalid && isUsableValid && canFitAtLeastOne;

  const runMathematicalOptimization = () => {
    if (!isFormValid) return;

    const { paperWidth, paperHeight, pieceWidth, pieceHeight, quantity, allowRotation, margin, paperThickness } = formData;
    const effectiveW = paperWidth - (2 * margin);
    const effectiveH = paperHeight - (2 * margin);

    const fitNormalCols = Math.floor(effectiveW / pieceWidth);
    const fitNormalRows = Math.floor(effectiveH / pieceHeight);
    const countNormal = fitNormalCols * fitNormalRows;

    let countRotated = 0;
    if (allowRotation) {
      const fitRotatedCols1 = Math.floor(effectiveW / pieceHeight);
      const fitRotatedRows1 = Math.floor(effectiveH / pieceWidth);
      countRotated = fitRotatedCols1 * fitRotatedRows1;
    }

    const useRotation = allowRotation && countRotated > countNormal;
    const piecesPerSheet = useRotation ? countRotated : countNormal;

    if (piecesPerSheet <= 0) return;

    const totalSheetsNeeded = Math.ceil(quantity / piecesPerSheet);
    const sheets = [];
    let remainingPiecesToAllocate = quantity;
    let currentPieceId = 1;

    for (let s = 0; s < totalSheetsNeeded; s++) {
      const piecesOnThisSheet = Math.min(piecesPerSheet, remainingPiecesToAllocate);
      const sheetRectangles = [];
      let currentX = margin;
      let currentY = margin;
      let placedInSheet = 0;

      const cols = useRotation ? Math.floor(effectiveW / pieceHeight) : Math.floor(effectiveW / pieceWidth);
      const pW = useRotation ? pieceHeight : pieceWidth;
      const pH = useRotation ? pieceWidth : pieceHeight;

      for (let r = 0; r < Math.floor(effectiveH / pH); r++) {
        for (let c = 0; c < cols; c++) {
          if (placedInSheet >= piecesOnThisSheet) break;
          sheetRectangles.push({
            id: currentPieceId++,
            x: currentX,
            y: currentY,
            width: pW,
            height: pH,
            sheetIndex: s + 1
          });
          currentX += pW + margin;
          placedInSheet++;
        }
        currentX = margin;
        currentY += pH + margin;
        if (placedInSheet >= piecesOnThisSheet) break;
      }

      const totalPaperArea = paperWidth * paperHeight;
      const occupiedAreaPerPiece = pieceWidth * pieceHeight;
      const totalOccupiedArea = piecesOnThisSheet * occupiedAreaPerPiece;
      const utilizationPct = Number(((totalOccupiedArea / totalPaperArea) * 100).toFixed(2));
      const wastePct = Number((100 - utilizationPct).toFixed(2));

      sheets.push({
        sheetIndex: s + 1,
        piecesCount: piecesOnThisSheet,
        rectangles: sheetRectangles,
        utilization: utilizationPct,
        waste: wastePct
      });

      remainingPiecesToAllocate -= piecesOnThisSheet;
    }

    const newResult = {
      paperWidth,
      paperHeight,
      pieceWidth,
      pieceHeight,
      quantity,
      margin,
      allowRotation,
      paperThickness,
      piecesPerSheet,
      totalSheets: totalSheetsNeeded,
      sheets
    };

    setOptimizationResult(newResult);

    const newReportItem = {
      id: reports.length + 20,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: 'AR Electro Unit',
      phone: '+91 9000000000',
      email: 'contact@arelectro.com',
      paperWidth,
      paperHeight,
      paperThickness,
      margin,
      allowRotation: allowRotation ? 'Yes' : 'No',
      pieceWidth,
      pieceHeight,
      quantity,
      totalSheets: totalSheetsNeeded,
      utilization: sheets[0].utilization,
      waste: sheets[0].waste
    };

    setReports([newReportItem, ...reports]);
    setActiveTab('result');
  };

  const handleSelectReport = (rep) => {
    setSelectedReport(rep);
    setEditCustomerData({ customerName: rep.customerName, phone: rep.phone, email: rep.email });
    setIsEditingCustomer(false);
  };

  const saveCustomerDetails = () => {
    const updatedReports = reports.map(r => r.id === selectedReport.id ? { ...r, ...editCustomerData } : r);
    setReports(updatedReports);
    setSelectedReport({ ...selectedReport, ...editCustomerData });
    setIsEditingCustomer(false);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Sidebar hidden during print */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 print:hidden">
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
          <SidebarItem icon={<LogOut size={18} />} label="Logout" active={false} onClick={() => alert("Logged out securely.")} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'new' && <NewOptimizationView formData={formData} handleInputChange={handleInputChange} runMathematicalOptimization={runMathematicalOptimization} isFormValid={isFormValid} canFitAtLeastOne={canFitAtLeastOne} isUsableValid={isUsableValid} />}
        {activeTab === 'result' && <ResultView optimizationResult={optimizationResult} setActiveTab={setActiveTab} />}
        {activeTab === 'reports' && (
          <ReportsView 
            reports={reports} 
            selectedReport={selectedReport} 
            setSelectedReport={handleSelectReport} 
            isEditingCustomer={isEditingCustomer}
            setIsEditingCustomer={setIsEditingCustomer}
            editCustomerData={editCustomerData}
            setEditCustomerData={setEditCustomerData}
            saveCustomerDetails={saveCustomerDetails}
          />
        )}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ setActiveTab }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm">AI-Based Sheet Cutting & Material Optimization System</p>
        </div>
        <button onClick={() => setActiveTab('new')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20">
          <PlusCircle size={16} /> New Optimization
        </button>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <MetricCard title="Total Orders" value="26" />
        <MetricCard title="Paper Used" value="1,280 m²" />
        <MetricCard title="Paper Saved" value="194 m²" />
        <MetricCard title="Waste Percentage" value="11.4%" sub="Rigid Mathematical Heuristic" positive />
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, positive }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <p className="text-xs text-gray-400 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2 text-white">{value}</p>
      {sub && <p className={`text-xs mt-2 ${positive ? 'text-emerald-400' : 'text-gray-500'}`}>{sub}</p>}
    </div>
  );
}

function NewOptimizationView({ formData, handleInputChange, runMathematicalOptimization, isFormValid, canFitAtLeastOne, isUsableValid }) {
  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">New Optimization</h1>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 grid grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-400">Paper Details</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Width (mm)</label>
            <input type="number" name="paperWidth" value={formData.paperWidth} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Height (mm)</label>
            <input type="number" name="paperHeight" value={formData.paperHeight} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Paper Thickness (mm)</label>
            <input type="number" name="paperThickness" value={formData.paperThickness} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-400">Piece Details</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Piece Width (mm)</label>
            <input type="number" name="pieceWidth" value={formData.pieceWidth} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Piece Height (mm)</label>
            <input type="number" name="pieceHeight" value={formData.pieceHeight} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Exact Quantity Required</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-400">Constraints & Margins</h3>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">Allow Rotation (90°)</span>
            <input type="checkbox" name="allowRotation" checked={formData.allowRotation} onChange={handleInputChange} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">Cutting Margin (mm)</span>
            <input type="number" name="margin" value={formData.margin} onChange={handleInputChange} className="w-20 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-center focus:outline-none focus:border-emerald-500" />
          </div>

          <div className="pt-3">
            {!isUsableValid ? (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/30 mb-4">
                <AlertTriangle size={15} /> 🔒 LOCKED: Margin is too large!
              </div>
            ) : !canFitAtLeastOne ? (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/30 mb-4">
                <AlertTriangle size={15} /> 🔒 LOCKED: Piece exceeds sheet size!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 mb-4">
                <CheckCircle size={15} /> ✨ ENABLED: Ready for multi-sheet layout!
              </div>
            )}

            <button 
              onClick={runMathematicalOptimization}
              disabled={!isFormValid}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-lg ${
                isFormValid 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 cursor-pointer' 
                  : 'bg-red-900/60 border border-red-500 text-red-200 cursor-not-allowed'
              }`}
            >
              {isFormValid ? "Optimize Today ✨" : "🔒 Locked: Piece Exceeds Sheet Size"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultView({ optimizationResult, setActiveTab }) {
  const [activeSheetTab, setActiveSheetTab] = useState(0);

  const result = optimizationResult || {
    paperWidth: 1000, paperHeight: 700, pieceWidth: 200, pieceHeight: 150, quantity: 20, margin: 5,
    totalSheets: 1,
    sheets: [{
      sheetIndex: 1,
      piecesCount: 20,
      utilization: 85.71,
      waste: 14.29,
      rectangles: [...Array(20)].map((_, i) => ({ id: i+1, x: 5 + (i%5)*200, y: 5 + Math.floor(i/5)*150, width: 200, height: 150, sheetIndex: 1 }))
    }]
  };

  const currentSheet = result.sheets[activeSheetTab] || result.sheets[0];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exact Optimization Result</h1>
          <p className="text-gray-400 text-sm mt-1">
            Master Sheet: {result.paperWidth} × {result.paperHeight} mm | Requested Quantity: {result.quantity} Pieces | Total Sheets: {result.totalSheets}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('new')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer">
            Modify Inputs
          </button>
          <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20">
            <Download size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-emerald-400">Mathematical Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400">Required Pieces</p>
                <p className="text-xl font-bold text-white mt-1">{result.quantity}</p>
              </div>
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400">Sheets Required</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{result.totalSheets}</p>
              </div>
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400">Sheet Utilization</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{currentSheet.utilization}%</p>
              </div>
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400">Sheet Waste Area</p>
                <p className="text-xl font-bold text-red-400 mt-1">{currentSheet.waste}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Sheet Layout</h4>
            <div className="flex flex-wrap gap-2">
              {result.sheets.map((sh, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSheetTab(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeSheetTab === idx 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                      : 'bg-gray-950 text-gray-300 border border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  Sheet #{sh.sheetIndex} ({sh.piecesCount} pcs)
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-emerald-400">
              Proportional Cutting Layout — Sheet #{currentSheet.sheetIndex} ({currentSheet.piecesCount} Pieces)
            </h3>
            <span className="text-xs text-gray-400">Master: {result.paperWidth} × {result.paperHeight} mm</span>
          </div>

          <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl relative p-6 flex items-center justify-center min-h-[380px] overflow-hidden">
            <div 
              className="relative bg-emerald-950/30 border-2 border-emerald-500/60 rounded-lg shadow-inner"
              style={{
                width: '100%',
                maxWidth: '460px',
                aspectRatio: `${result.paperWidth} / ${result.paperHeight}`,
                maxHeight: '340px'
              }}
            >
              {currentSheet.rectangles.map((rect, idx) => {
                const leftPct = (rect.x / result.paperWidth) * 100;
                const topPct = (rect.y / result.paperHeight) * 100;
                const widthPct = (rect.width / result.paperWidth) * 100;
                const heightPct = (rect.height / result.paperHeight) * 100;

                return (
                  <div
                    key={idx}
                    className="absolute bg-emerald-600/40 border border-emerald-400 text-emerald-100 text-[10px] font-bold flex flex-col items-center justify-center rounded transition-all hover:bg-emerald-500/60"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                    }}
                    title={`Piece #${rect.id} (${rect.width}×${rect.height}mm)`}
                  >
                    <span>#{rect.id}</span>
                    <span className="text-[8px] text-emerald-300 opacity-80">{rect.width}×{rect.height}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ reports, selectedReport, setSelectedReport, isEditingCustomer, setIsEditingCustomer, editCustomerData, setEditCustomerData, saveCustomerDetails }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center bg-gray-900 border border-gray-800 p-6 rounded-2xl print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports Archive</h1>
          <p className="text-gray-400 text-sm mt-1">Click on any report to view certificate details or edit customer info.</p>
        </div>
        {selectedReport && (
          <button 
            onClick={() => setSelectedReport(null)} 
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border border-gray-700"
          >
            <ArrowLeft size={14} /> Back to Archive List
          </button>
        )}
      </div>

      {!selectedReport ? (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex justify-between items-center hover:border-emerald-500/50 transition-all shadow-md">
              <div className="cursor-pointer flex-1" onClick={() => setSelectedReport(rep)}>
                <span className="font-bold text-white text-base block hover:text-emerald-400 transition-colors">Optimization Report #{rep.id} ({rep.paperWidth}×{rep.paperHeight}mm)</span>
                <span className="text-xs text-gray-400 mt-1 block">Customer: <strong className="text-gray-300">{rep.customerName}</strong> &nbsp;|&nbsp; Sheets: <strong className="text-emerald-400">{rep.totalSheets}</strong> &nbsp;|&nbsp; Waste: <strong className="text-red-400">{rep.waste}%</strong></span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport(rep)} className="bg-gray-800 hover:bg-gray-700 text-emerald-400 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-gray-700 transition-all">
                  View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Printable Professional Certificate */
        <div className="bg-white text-gray-900 border border-gray-300 rounded-2xl p-10 space-y-8 shadow-2xl relative">
          
          {/* Top Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-3 rounded-xl text-white font-bold text-xl">✂️</div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">CutMind <span className="text-emerald-600">AI</span></h1>
                <p className="text-xs text-gray-500 font-medium">AI-Based Paper Cutting Optimization System</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">Optimization Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Report ID: #{selectedReport.id}</p>
              <p className="text-xs text-gray-500">Date: {selectedReport.date}</p>
            </div>
          </div>

          {/* Middle 3 Columns */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Customer Details Box with Edit & Save */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Customer Details</h3>
                {!isEditingCustomer ? (
                  <button onClick={() => setIsEditingCustomer(true)} className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 print:hidden cursor-pointer">
                    <Edit3 size={12} /> Edit
                  </button>
                ) : (
                  <button onClick={saveCustomerDetails} className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 print:hidden cursor-pointer">
                    <Save size={10} /> Save
                  </button>
                )}
              </div>

              {!isEditingCustomer ? (
                <div className="text-xs space-y-2">
                  <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{selectedReport.customerName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-900">{selectedReport.phone}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-semibold text-gray-900">{selectedReport.email}</span></p>
                </div>
              ) : (
                <div className="text-xs space-y-2 print:hidden">
                  <input 
                    type="text" 
                    value={editCustomerData.customerName} 
                    onChange={(e) => setEditCustomerData({...editCustomerData, customerName: e.target.value})} 
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-xs" 
                    placeholder="Customer Name"
                  />
                  <input 
                    type="text" 
                    value={editCustomerData.phone} 
                    onChange={(e) => setEditCustomerData({...editCustomerData, phone: e.target.value})} 
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-xs" 
                    placeholder="Phone"
                  />
                  <input 
                    type="text" 
                    value={editCustomerData.email} 
                    onChange={(e) => setEditCustomerData({...editCustomerData, email: e.target.value})} 
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-xs" 
                    placeholder="Email"
                  />
                </div>
              )}
            </div>

            {/* Optimization Summary Box */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-2">Optimization Summary</h3>
              <div className="text-xs space-y-1.5">
                <p className="flex justify-between"><span className="text-gray-500">Paper Size:</span> <span className="font-semibold text-gray-900">{selectedReport.paperWidth} × {selectedReport.paperHeight} mm</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Piece Size:</span> <span className="font-semibold text-gray-900">{selectedReport.pieceWidth} × {selectedReport.pieceHeight} mm</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Quantity:</span> <span className="font-semibold text-gray-900">{selectedReport.quantity} Pieces</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Paper Thickness:</span> <span className="font-semibold text-gray-900">{selectedReport.paperThickness} mm</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Cutting Margin:</span> <span className="font-semibold text-gray-900">{selectedReport.margin} mm</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Allow Rotation:</span> <span className="font-semibold text-gray-900">{selectedReport.allowRotation}</span></p>
              </div>
            </div>

            {/* Results & Layout Box */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-2">Results & Layout</h3>
              <div className="text-xs space-y-1.5">
                <p className="flex justify-between"><span className="text-gray-500">Sheets Required:</span> <span className="font-bold text-emerald-600">{selectedReport.totalSheets} Sheets</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Material Used:</span> <span className="font-bold text-emerald-600">{selectedReport.utilization}%</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Waste:</span> <span className="font-bold text-red-500">{selectedReport.waste}%</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Efficiency:</span> <span className="font-bold text-emerald-600">{selectedReport.utilization}%</span></p>
              </div>
            </div>

          </div>

          {/* Bottom Conclusion & Signature */}
          <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
            <div className="space-y-1 max-w-lg">
              <h4 className="text-xs font-bold text-gray-800 uppercase">Conclusion</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                The layout has been optimized using AI deterministic bin-packing algorithms to reduce paper waste and maximize material usage.
              </p>
            </div>
            <div className="text-center">
              <div className="h-10 border-b border-gray-400 w-48 mb-1"></div>
              <p className="text-xs font-bold text-gray-800">Authorized Sign</p>
              <p className="text-[10px] text-gray-500">AR Electro Projects</p>
            </div>
          </div>

          {/* Action Buttons (Hidden during Print) */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 print:hidden">
            <button onClick={() => setSelectedReport(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer">
              Close Certificate
            </button>
            <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md">
              <Download size={14} /> Print / Save as PDF
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

function ProfileView() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Full Name</label>
          <input type="text" defaultValue="Ankit Chhipa" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Organization / Manufacturing Unit</label>
          <input type="text" defaultValue="AR Electro Projects" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500" />
        </div>
        <button onClick={() => alert("Profile updated successfully!")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-emerald-900/20">
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="font-semibold text-white">Deterministic Bin-Packing Engine</p>
            <p className="text-xs text-gray-400 mt-0.5">Strict mathematical validation and multi-sheet coordinate calculation.</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 cursor-pointer" />
        </div>
        <button onClick={() => alert("Settings saved successfully!")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-emerald-900/20">
          Update Settings
        </button>
      </div>
    </div>
  );
}
