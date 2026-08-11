import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, FileText, User, Settings, LogOut, Download } from 'lucide-react';

export default function CutMindApp() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return ( <
            div className = "flex h-screen bg-gray-950 text-gray-100 font-sans" > { /* Sidebar Navigation */ } <
            aside className = "w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4" >
            <
            div >
            <
            div className = "flex items-center gap-3 px-2 mb-8" >
            <
            div className = "bg-emerald-500 p-2 rounded-lg text-black font-bold" > ✂️ < /div> <
            span className = "text-xl font-bold tracking-wide text-white" > CutMind < span className = "text-emerald-400" > AI < /span></span >
            <
            /div>

            <
            nav className = "space-y-1" >
            <
            SidebarItem icon = { < LayoutDashboard size = { 18 }
                />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} / >
                <
                SidebarItem icon = { < PlusCircle size = { 18 }
                    />} label="New Optimization" active={activeTab === 'new'} onClick={() => setActiveTab('new')} / >
                    <
                    SidebarItem icon = { < FileText size = { 18 }
                        />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} / >
                        <
                        SidebarItem icon = { < User size = { 18 }
                            />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} / >
                            <
                            SidebarItem icon = { < Settings size = { 18 }
                                />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} / >
                                <
                                /nav> <
                                /div>

                                <
                                div >
                                <
                                SidebarItem icon = { < LogOut size = { 18 }
                                    />} label="Logout" active={false} onClick={() => {}} / >
                                    <
                                    /div> <
                                    /aside>

                                    { /* Main Content Area */ } <
                                    main className = "flex-1 overflow-y-auto p-8" > { activeTab === 'dashboard' && < DashboardView / > } { activeTab === 'new' && < NewOptimizationView / > } <
                                    /main> <
                                    /div>
                                );
                            }

                            function SidebarItem({ icon, label, active, onClick }) {
                                return ( <
                                    button onClick = { onClick }
                                    className = { `flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }` } >
                                    { icon } <
                                    span > { label } < /span> <
                                    /button>
                                );
                            }

                            function DashboardView() {
                                return ( <
                                    div className = "space-y-6" >
                                    <
                                    h1 className = "text-2xl font-bold" > Dashboard < /h1> <
                                    p className = "text-gray-400 text-sm" > Welcome back, Ace! < /p>

                                    { /* Metric Cards Grid */ } <
                                    div className = "grid grid-cols-4 gap-4" >
                                    <
                                    MetricCard title = "Total Orders"
                                    value = "25" / >
                                    <
                                    MetricCard title = "Paper Used"
                                    value = "1250 m²" / >
                                    <
                                    MetricCard title = "Paper Saved"
                                    value = "185 m²" / >
                                    <
                                    MetricCard title = "Waste Percentage"
                                    value = "12.8%"
                                    sub = "4.5% from last month"
                                    positive / >
                                    <
                                    /div>

                                    { /* Recent Optimizations Table */ } <
                                    div className = "bg-gray-900 border border-gray-800 rounded-2xl p-6" >
                                    <
                                    h3 className = "text-lg font-semibold mb-4" > Recent Optimizations < /h3> <
                                    table className = "w-full text-left text-sm text-gray-300" >
                                    <
                                    thead className = "border-b border-gray-800 text-gray-400" >
                                    <
                                    tr >
                                    <
                                    th className = "pb-3" > ID < /th> <
                                    th className = "pb-3" > Paper Size(mm) < /th> <
                                    th className = "pb-3" > Pieces < /th> <
                                    th className = "pb-3" > Waste % < /th> <
                                    th className = "pb-3" > Date < /th> <
                                    /tr> <
                                    /thead> <
                                    tbody className = "divide-y divide-gray-800" >
                                    <
                                    tr >
                                    <
                                    td className = "py-3 font-medium text-white" > #25</td>

              <td className= "py-3" > 1000 x 700 < /td> <
                                    td className = "py-3" > 20 < /td> <
                                    td className = "py-3 text-emerald-400" > 5.2 % < /td> <
                                    td className = "py-3" > 03 May 2024 < /td> <
                                    /tr> <
                                    tr >
                                    <
                                    td className = "py-3 font-medium text-white" > #24</td>

              <td className= "py-3" > 1200 x 800 < /td> <
                                    td className = "py-3" > 35 < /td> <
                                    td className = "py-3 text-emerald-400" > 8.7 % < /td> <
                                    td className = "py-3" > 02 May 2024 < /td> <
                                    /tr> <
                                    /tbody> <
                                    /table> <
                                    /div> <
                                    /div>
                                );
                            }

                            function MetricCard({ title, value, sub, positive }) {
                                return ( <
                                    div className = "bg-gray-900 border border-gray-800 rounded-2xl p-5" >
                                    <
                                    p className = "text-xs text-gray-400 font-medium" > { title } < /p> <
                                    p className = "text-3xl font-bold mt-2 text-white" > { value } < /p> {
                                        sub && < p className = { `text-xs mt-2 ${positive ? 'text-emerald-400' : 'text-gray-500'}` } > { sub } < /p>} <
                                            /div>
                                    );
                                }

                                function NewOptimizationView() {
                                    return ( <
                                        div className = "space-y-6" >
                                        <
                                        h1 className = "text-2xl font-bold" > New Optimization < /h1>

                                        <
                                        div className = "bg-gray-900 border border-gray-800 rounded-2xl p-6 grid grid-cols-3 gap-6" > { /* Paper Details */ } <
                                        div className = "space-y-4" >
                                        <
                                        h3 className = "font-semibold text-emerald-400" > Paper Details < /h3> <
                                        div >
                                        <
                                        label className = "text-xs text-gray-400 block mb-1" > Paper Width(mm) < /label> <
                                        input type = "number"
                                        defaultValue = { 1000 }
                                        className = "w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        div >
                                        <
                                        label className = "text-xs text-gray-400 block mb-1" > Paper Height(mm) < /label> <
                                        input type = "number"
                                        defaultValue = { 700 }
                                        className = "w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        div >
                                        <
                                        label className = "text-xs text-gray-400 block mb-1" > Paper Thickness(mm) < /label> <
                                        input type = "number"
                                        defaultValue = { 0.2 }
                                        className = "w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        /div>

                                        { /* Piece Details */ } <
                                        div className = "space-y-4" >
                                        <
                                        h3 className = "font-semibold text-emerald-400" > Piece Details < /h3> <
                                        div >
                                        <
                                        label className = "text-xs text-gray-400 block mb-1" > Piece Width(mm) < /label> <
                                        input type = "number"
                                        defaultValue = { 200 }
                                        className = "w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        div >
                                        <
                                        label className = "text-xs text-gray-400 block mm-1" > Piece Height(mm) < /label> <
                                        input type = "number"
                                        defaultValue = { 150 }
                                        className = "w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        div >
                                        <
                                        label className = "text-xs text-gray-400 block mb-1" > Quantity(Pieces) < /label> <
                                        input type = "number"
                                        defaultValue = { 20 }
                                        className = "w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        /div>

                                        { /* Options */ } <
                                        div className = "space-y-4" >
                                        <
                                        h3 className = "font-semibold text-emerald-400" > Options < /h3> <
                                        div className = "flex items-center justify-between py-2" >
                                        <
                                        span className = "text-sm text-gray-300" > Allow Rotation < /span> <
                                        input type = "checkbox"
                                        defaultChecked className = "toggle accent-emerald-500 w-5 h-5" / >
                                        <
                                        /div> <
                                        div className = "flex items-center justify-between py-2" >
                                        <
                                        span className = "text-sm text-gray-300" > Cutting Margin(mm) < /span> <
                                        input type = "number"
                                        defaultValue = { 5 }
                                        className = "w-20 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1 text-white text-center focus:outline-none focus:border-emerald-500" / >
                                        <
                                        /div> <
                                        button className = "w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20" >
                                        Optimize Now✨ <
                                        /button> <
                                        /div> <
                                        /div> <
                                        /div>
                                    );
                                }