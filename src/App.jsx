import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, FileText, User, Settings, LogOut, Download, AlertTriangle, CheckCircle, ArrowLeft, Edit3, Save, Moon, Sun } from 'lucide-react';

export default function CutMindApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);

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
      id: 22,
      date: '29 Sept 2026',
      customerName: 'AR Electro Projects',
      phone: '+91 9000000000',
      email: 'rajeshbhaichipa-1@okhdfcbank',
      paperWidth: 1023,
      paperHeight: 700,
      paperThickness: 0.2,
      margin: 5,
      allowRotation: 'Yes',
      pieceWidth: 200,
      pieceHeight: 150,
      quantity: 20,
      totalSheets: 1,
      utilization: 83.79,
      waste: 16.21
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

    const now = new Date();
    const newReportItem = {
      id: reports.length + 20,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: 'AR Electro Projects',
      phone: '+91 9000000000',
      email: 'rajeshbhaichipa-1@okhdfcbank',
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

  const themeBg = darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900';
  const sidebarBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className={`flex h-screen font-sans ${themeBg}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 5mm;
            size: portrait;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .certificate-box {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            padding: 10px !important;
          }
        }
      `}} />

      <aside className={`w-64 border-r flex flex-col justify-between p-4 print:hidden ${sidebarBg}`}>
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-emerald-500 p-2 rounded-lg text-black font-bold">✂️</div>
            <span className="text-xl font-bold tracking-wide">CutMind <span className="text-emerald-500">AI</span></span>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} darkMode={darkMode} />
            <SidebarItem icon={<PlusCircle size={18} />} label="New Optimization" active={activeTab === 'new'} onClick={() => setActiveTab('new')} darkMode={darkMode} />
            <SidebarItem icon={<FileText size={18} />} label="Optimization Result" active={activeTab === 'result'} onClick={() => setActiveTab('result')} darkMode={darkMode} />
            <SidebarItem icon={<FileText size={18} />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} darkMode={darkMode} />
            <SidebarItem icon={<User size={18} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} darkMode={darkMode} />
            <SidebarItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} darkMode={darkMode} />
          </nav>
        </div>

        <div>
          <SidebarItem icon={<LogOut size={18} />} label="Logout" active={false} onClick={() => alert("Logged out securely.")} darkMode={darkMode} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 print:p-0 print:overflow-visible">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} cardBg={cardBg} darkMode={darkMode} />}
        {activeTab === 'new' && <NewOptimizationView formData={formData} handleInputChange={handleInputChange} runMathematicalOptimization={runMathematicalOptimization} isFormValid={isFormValid} canFitAtLeastOne={canFitAtLeastOne} isUsableValid={isUsableValid} cardBg={cardBg} darkMode={darkMode} />}
        {activeTab === 'result' && <ResultView optimizationResult={optimizationResult} setActiveTab={setActiveTab} cardBg={cardBg} darkMode={darkMode} />}
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
            cardBg={cardBg}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'profile' && <ProfileView cardBg={cardBg} darkMode={darkMode} />}
        {activeTab === 'settings' && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} cardBg={cardBg} />}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, darkMode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ setActiveTab, cardBg, darkMode }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>AI-Based Sheet Cutting & Material Optimization System</p>
        </div>
        <button onClick={() => setActiveTab('new')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg">
          <PlusCircle size={16} /> New Optimization
        </button>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <MetricCard title="Total Orders" value="26" cardBg={cardBg} darkMode={darkMode} />
        <MetricCard title="Paper Used" value="1,280 m²" cardBg={cardBg} darkMode={darkMode} />
        <MetricCard title="Paper Saved" value="194 m²" cardBg={cardBg} darkMode={darkMode} />
        <MetricCard title="Waste Percentage" value="11.4%" sub="Rigid Mathematical Heuristic" positive cardBg={cardBg} darkMode={darkMode} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, positive, cardBg, darkMode }) {
  return (
    <div className={`border rounded-2xl p-6 ${cardBg}`}>
      <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {sub && <p className={`text-xs mt-2 ${positive ? 'text-emerald-500' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

function NewOptimizationView({ formData, handleInputChange, runMathematicalOptimization, isFormValid, canFitAtLeastOne, isUsableValid, cardBg, darkMode }) {
  const inputBg = darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">New Optimization</h1>
      
      <div className={`border rounded-2xl p-8 grid grid-cols-3 gap-8 ${cardBg}`}>
        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-500">Paper Details</h3>
          <div>
            <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paper Width (mm)</label>
            <input type="number" name="paperWidth" value={formData.paperWidth} onChange={handleInputChange} className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
          </div>
          <div>
            <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paper Height (mm)</label>
            <input type="number" name="paperHeight" value={formData.paperHeight} onChange={handleInputChange} className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
          </div>
          <div>
            <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paper Thickness (mm)</label>
            <input type="number" name="paperThickness" value={formData.paperThickness} onChange={handleInputChange} className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-500">Piece Details</h3>
          <div>
            <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Piece Width (mm)</label>
            <input type="number" name="pieceWidth" value={formData.pieceWidth} onChange={handleInputChange} className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
          </div>
          <div>
            <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Piece Height (mm)</label>
            <input type="number" name="pieceHeight" value={formData.pieceHeight} onChange={handleInputChange} className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
          </div>
          <div>
            <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Exact Quantity Required</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-emerald-500">Constraints & Margins</h3>
          <div className="flex items-center justify-between py-2">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allow Rotation (90°)</span>
            <input type="checkbox" name="allowRotation" checked={formData.allowRotation} onChange={handleInputChange} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cutting Margin (mm)</span>
            <input type="number" name="margin" value={formData.margin} onChange={handleInputChange} className={`w-20 border rounded-xl px-3 py-2 text-center focus:outline-none focus:border-emerald-500 ${inputBg}`} />
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
              <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 mb-4">
                <CheckCircle size={15} /> ✨ ENABLED: Ready for multi-sheet layout!
              </div>
            )}

            <button 
              onClick={runMathematicalOptimization}
              disabled={!isFormValid}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-lg ${
                isFormValid 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-900/20' 
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

function ResultView({ optimizationResult, setActiveTab, cardBg, darkMode }) {
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
  const innerCardBg = darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200';

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exact Optimization Result</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Master Sheet: {result.paperWidth} × {result.paperHeight} mm | Requested Quantity: {result.quantity} Pieces | Total Sheets: {result.totalSheets}
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button onClick={() => setActiveTab('new')} className={`px-4 py-2.5 rounded-xl font-semibold text-sm border cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'}`}>
            Modify Inputs
          </button>
          <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-lg">
            <Download size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className={`border rounded-2xl p-6 space-y-4 ${cardBg}`}>
            <h3 className="font-semibold text-emerald-500">Mathematical Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`border p-3.5 rounded-xl ${innerCardBg}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Required Pieces</p>
                <p className="text-xl font-bold mt-1">{result.quantity}</p>
              </div>
              <div className={`border p-3.5 rounded-xl ${innerCardBg}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sheets Required</p>
                <p className="text-xl font-bold text-emerald-500 mt-1">{result.totalSheets}</p>
              </div>
              <div className={`border p-3.5 rounded-xl ${innerCardBg}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sheet Utilization</p>
                <p className="text-xl font-bold text-emerald-500 mt-1">{currentSheet.utilization}%</p>
              </div>
              <div className={`border p-3.5 rounded-xl ${innerCardBg}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sheet Waste Area</p>
                <p className="text-xl font-bold text-red-500 mt-1">{currentSheet.waste}%</p>
              </div>
            </div>
          </div>

          <div className={`border rounded-2xl p-5 space-y-3 ${cardBg}`}>
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select Sheet Layout</h4>
            <div className="flex flex-wrap gap-2">
              {result.sheets.map((sh, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSheetTab(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeSheetTab === idx 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : darkMode ? 'bg-gray-950 text-gray-300 border border-gray-800 hover:bg-gray-800' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Sheet #{sh.sheetIndex} ({sh.piecesCount} pcs)
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 flex flex-col ${cardBg}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-emerald-500">
              Proportional Cutting Layout — Sheet #{currentSheet.sheetIndex} ({currentSheet.piecesCount} Pieces)
            </h3>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Master: {result.paperWidth} × {result.paperHeight} mm</span>
          </div>

          <div className={`flex-1 border rounded-xl relative p-6 flex items-center justify-center min-h-[380px] overflow-hidden ${innerCardBg}`}>
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

function ReportsView({ reports, selectedReport, setSelectedReport, isEditingCustomer, setIsEditingCustomer, editCustomerData, setEditCustomerData, saveCustomerDetails, cardBg, darkMode }) {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className={`border p-6 rounded-2xl print:hidden flex justify-between items-center ${cardBg}`}>
        <div>
          <h1 className="text-2xl font-bold">Reports Archive</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click on any report to view certificate details or edit customer info.</p>
        </div>
        {selectedReport && (
          <button 
            onClick={() => setSelectedReport(null)} 
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer border transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'}`}
          >
            <ArrowLeft size={14} /> Back to Archive List
          </button>
        )}
      </div>

      {!selectedReport ? (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className={`border p-5 rounded-2xl flex justify-between items-center transition-all shadow-md ${cardBg}`}>
              <div className="cursor-pointer flex-1" onClick={() => setSelectedReport(rep)}>
                <span className="font-bold text-base block hover:text-emerald-500 transition-colors">Optimization Report #{rep.id} ({rep.paperWidth}×{rep.paperHeight}mm)</span>
                <span className={`text-xs mt-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer: <strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{rep.customerName}</strong> &nbsp;|&nbsp; Sheets: <strong className="text-emerald-500">{rep.totalSheets}</strong> &nbsp;|&nbsp; Waste: <strong className="text-red-500">{rep.waste}%</strong></span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport(rep)} className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-emerald-400 hover:bg-gray-700' : 'bg-gray-100 border-gray-300 text-emerald-600 hover:bg-gray-200'}`}>
                  View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Printable Professional Certificate */
        <div className="certificate-box bg-white text-gray-900 border border-gray-300 rounded-2xl p-10 space-y-8 shadow-2xl relative">
          
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

function ProfileView({ cardBg, darkMode }) {
  const inputBg = darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <div className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
        <div>
          <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
          <input type="text" defaultValue="Ankit Chhipa" className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
        </div>
        <div>
          <label className={`text-xs block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Organization / Manufacturing Unit</label>
          <input type="text" defaultValue="AR Electro Projects" className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 ${inputBg}`} />
        </div>
        <button onClick={() => alert("Profile updated successfully!")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer shadow-lg">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SettingsView({ darkMode, setDarkMode, cardBg }) {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <div className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-semibold flex items-center gap-2">
              {darkMode ? <Moon size={18} className="text-emerald-400" /> : <Sun size={18} className="text-amber-500" />}
              Dark Mode Appearance
            </p>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toggle between Dark and Light theme interface.</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              darkMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-800 text-white'
            }`}
          >
            {darkMode ? '🌙 Dark ON' : '☀️ Light ON'}
          </button>
        </div>
      </div>
    </div>
  );
}
