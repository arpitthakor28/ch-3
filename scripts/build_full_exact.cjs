const fs = require('fs');
const path = require('path');

const generateHtml = () => {
return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>NCERT Class 9 Biology Lab | Chapter 3: Tissues in Action</title>
    
    <meta name="author" content="VLS Biology Lab">
    <meta name="copyright" content="NCERT Class 9 Science Virtual Lab Simulator">
    <meta name="color-scheme" content="light">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    
    <!-- KaTeX for crisp scientific mathematical formulas -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>

    <!-- Canvas Confetti for milestones -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&family=Orbitron:wght@600;700;800&display=swap');

        :root { 
            --bg: #f8fafc; 
            --panel-bg: rgba(255, 255, 255, 0.94);
            --panel-border: #e2e8f0;
            --primary: #2563eb;
            --accent: #059669;
        }
        
        *, *::before, *::after {
            box-sizing: border-box;
        }

        html, body { 
            height: 100%;
            height: 100dvh;
            margin: 0; 
            padding: 0;
            overflow: hidden;
            background-color: #f8fafc; 
            color: #1e293b; 
            font-family: 'Inter', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .math-font { font-family: 'JetBrains Mono', monospace; }
        .digital-font { font-family: 'Orbitron', monospace; }
        .mono-font { font-family: 'JetBrains Mono', monospace; }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .glass-panel { 
            background: var(--panel-bg); 
            backdrop-filter: blur(16px); 
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--panel-border); 
            border-radius: 1.25rem; 
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); 
        }

        /* Sliders - Light Theme with Distinct Track Colors */
        input[type="range"] { 
            -webkit-appearance: none; 
            width: 100%; 
            height: 6px; 
            background: #e2e8f0; 
            border-radius: 4px; 
            outline: none; 
        }
        input[type="range"]::-webkit-slider-thumb { 
            -webkit-appearance: none; 
            width: 18px; 
            height: 18px; 
            background: #ffffff; 
            border-radius: 50%; 
            cursor: pointer; 
            transition: all 0.15s ease; 
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); 
            border: 2.5px solid var(--primary);
        }
        input[type="range"]::-webkit-slider-thumb:hover { 
            transform: scale(1.2); 
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
        }

        .slider-purple::-webkit-slider-thumb { border-color: #7c3aed; box-shadow: 0 0 10px rgba(124, 58, 237, 0.4); }
        .slider-purple::-webkit-slider-runnable-track { background: linear-gradient(90deg, #ddd6fe, #7c3aed); border-radius: 4px; }

        .slider-blue::-webkit-slider-thumb { border-color: #2563eb; box-shadow: 0 0 10px rgba(37, 99, 235, 0.4); }
        .slider-blue::-webkit-slider-runnable-track { background: linear-gradient(90deg, #bfdbfe, #2563eb); border-radius: 4px; }
        
        .slider-cyan::-webkit-slider-thumb { border-color: #0284c7; box-shadow: 0 0 10px rgba(2, 132, 199, 0.4); }
        .slider-cyan::-webkit-slider-runnable-track { background: linear-gradient(90deg, #bae6fd, #0284c7); border-radius: 4px; }

        .badge-purple { background-color: #f3e8ff; color: #7c3aed; border: 1px solid #d8b4fe; }
        .badge-blue { background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .badge-cyan { background-color: #ecfeff; color: #0891b2; border: 1px solid #a5f3fc; }
        .badge-emerald { background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }

        .telemetry-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;
        }

        /* Custom Radio Buttons */
        .custom-radio {
            appearance: none;
            width: 16px;
            height: 16px;
            border: 2px solid #cbd5e1;
            border-radius: 50%;
            outline: none;
            cursor: pointer;
            position: relative;
            vertical-align: middle;
            transition: all 0.15s ease;
        }
        .custom-radio:checked {
            border-color: #059669;
        }
        .custom-radio:checked::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 6px;
            height: 6px;
            background: #059669;
            border-radius: 50%;
        }

        /* Dribbble Style Dropdown */
        .dribbble-dropdown {
            border: 2px solid #2563eb;
            border-radius: 12px;
            background: #ffffff;
            color: #1e293b;
            font-weight: 700;
            padding: 7px 32px 7px 12px;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%232563eb%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 14px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
            transition: all 0.2s ease;
        }
        .dribbble-dropdown:hover {
            border-color: #1d4ed8;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
    </style>
</head>
<body class="flex flex-col h-screen overflow-hidden p-2 sm:p-3 lg:p-4 gap-2.5">

    <!-- TOP HEADER -->
    <header class="glass-panel p-2 sm:p-2.5 px-3 sm:px-4 lg:px-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0 z-20">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <i class="fa-solid fa-microscope text-lg"></i>
            </div>
            <div>
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        NCERT CLASS 9
                    </span>
                    <h1 class="text-sm sm:text-base font-black tracking-tight text-slate-900">
                        Class 9 Science: Chapter 3 – Tissues in Action
                    </h1>
                </div>
                <p id="header-sub" class="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Activity 3.1 • Growth of Roots in Onion Bulbs (Meristematic Tissue)
                </p>
            </div>
        </div>

        <!-- Simulation Selector & Actions -->
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <!-- 18 Simulation Dropdown -->
            <select id="sim-selector" onchange="sim.switchModule(this.value)" class="dribbble-dropdown text-xs sm:text-sm">
                <optgroup label="Plant Meristems">
                    <option value="M01" selected>M01: Onion Root Apical Meristem</option>
                    <option value="M02">M02: Meristem Locator (Apical / Lateral / Intercalary)</option>
                    <option value="M03">M03: Tree Rings and Annual Growth (Cambium)</option>
                    <option value="M04">M04: Grass and Hedge Regrowth (Intercalary)</option>
                </optgroup>
                <optgroup label="Permanent & Vascular Plant Tissues">
                    <option value="M05">M05: Plant Tissue Microscope (Parenchyma/Collenchyma)</option>
                    <option value="M06">M06: Xylem and Phloem Transport</option>
                    <option value="M07">M07: Plant Epidermal Tissue & Stomata</option>
                </optgroup>
                <optgroup label="Animal Epithelial & Connective Tissues">
                    <option value="M08">M08: Epithelial Tissue Types</option>
                    <option value="M09">M09: Blood Components & Centrifuge</option>
                    <option value="M10">M10: Connective Tissue (Areolar, Bone, Tendon)</option>
                </optgroup>
                <optgroup label="Muscular, Nervous & Skeletal Systems">
                    <option value="M11">M11: Muscle Tissue Comparison (Striated/Smooth/Cardiac)</option>
                    <option value="M12">M12: Neuron and Signal Pathway</option>
                    <option value="M13">M13: Muscle-Tendon-Bone Movement (Elbow)</option>
                    <option value="M14">M14: Joint Movement Lab (Synovial / Hinge)</option>
                    <option value="M15">M15: Skeleton and Breathing (Rib Cage / Diaphragm)</option>
                    <option value="M16">M16: Body Weight and Movement Mechanics</option>
                </optgroup>
                <optgroup label="Applied Plant Biotechnology">
                    <option value="M17">M17: Carrot Tissue Culture & Totipotency</option>
                    <option value="M18">M18: Crown Gall Experiment (Cell Proliferation)</option>
                </optgroup>
            </select>

            <!-- Audio Voice Toggle -->
            <button onclick="sim.toggleAudio()" id="btn-audio" class="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition shadow-xs cursor-pointer" title="Toggle audio narration & sound effects">
                <i id="audio-icon" class="fa-solid fa-volume-high text-blue-600"></i>
                <span id="audio-label" class="hidden sm:inline">Audio</span>
            </button>

            <!-- Reset All -->
            <button onclick="sim.resetCurrent()" class="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition shadow-xs cursor-pointer" title="Reset current simulation">
                <i class="fa-solid fa-rotate-left"></i>
                <span class="hidden sm:inline">Reset</span>
            </button>
        </div>
    </header>

    <!-- 3-PANEL MAIN CONTENT LAYOUT -->
    <main class="flex-1 flex flex-col lg:flex-row gap-2.5 overflow-hidden min-h-0 relative">
        
        <!-- LEFT PANEL: Parameters & Controls (Exact match to Image 2) -->
        <aside id="left-panel" class="glass-panel w-full lg:w-[320px] xl:w-[340px] p-3 lg:p-3.5 flex flex-col gap-2.5 shrink-0 h-full overflow-y-auto custom-scrollbar hidden lg:flex">
            
            <!-- Section 1: Experimental Timeline -->
            <div class="flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <i class="fa-solid fa-sliders text-blue-600 text-xs"></i>
                <h2 id="left-sec1-title" class="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">1. EXPERIMENTAL TIMELINE</h2>
            </div>

            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2.5">
                <!-- Primary Parameter Slider (Purple Track & Badge) -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label id="lbl-primary" class="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <i class="fa-regular fa-calendar text-purple-600"></i>
                            <span id="txt-primary">Experiment Day</span> (<span class="math-font text-purple-600" id="sym-primary">t</span>)
                        </label>
                        <span class="mono-font text-xs font-bold px-2 py-0.5 rounded badge-purple" id="val-primary">Day 7 of 7</span>
                    </div>
                    <input type="range" id="sl-primary" min="1" max="7" step="1" value="7" class="slider-purple" oninput="sim.onPrimaryChange(this.value)">
                </div>

                <!-- Secondary Zoom / Detail Slider (Blue Track & Badge) -->
                <div id="secondary-slider-group">
                    <div class="flex justify-between items-center mb-1">
                        <label id="lbl-secondary" class="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <i class="fa-solid fa-magnifying-glass text-blue-600"></i>
                            <span id="txt-secondary">Zoom / Detail</span> (<span class="math-font text-blue-600">M</span>)
                        </label>
                        <span class="mono-font text-xs font-bold px-2 py-0.5 rounded badge-blue" id="val-secondary">100x</span>
                    </div>
                    <input type="range" id="sl-zoom" min="50" max="250" step="5" value="100" class="slider-blue" oninput="sim.setZoomSlider(this.value)">
                </div>
            </div>

            <!-- Section 2: Active Lab Tools 2x2 Grid -->
            <div class="flex items-center gap-1.5 border-b border-slate-200 pb-1 mt-0.5">
                <i class="fa-solid fa-toolbox text-blue-600 text-xs"></i>
                <h2 class="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">2. ACTIVE LAB TOOLS</h2>
            </div>

            <div class="grid grid-cols-2 gap-1.5">
                <!-- Tool 1: Digital Caliper / Measure -->
                <button onclick="sim.toggleTool1()" id="btn-tool-1" class="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg flex items-center justify-between transition cursor-pointer text-left">
                    <div class="flex items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs">
                            <i class="fa-solid fa-ruler"></i>
                        </div>
                        <span id="lbl-tool-1" class="text-[10px] font-bold text-slate-800">Digital Ruler</span>
                    </div>
                    <span id="status-tool-1" class="text-[9px] font-mono font-bold text-slate-500">OFF</span>
                </button>

                <!-- Tool 2: Cut / Excision / Action -->
                <button onclick="sim.triggerTool2()" id="btn-tool-2" class="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg flex items-center justify-between transition cursor-pointer text-left">
                    <div class="flex items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs">
                            <i id="icon-tool-2" class="fa-solid fa-scissors"></i>
                        </div>
                        <span id="lbl-tool-2" class="text-[10px] font-bold text-slate-800">Cut Root Tip</span>
                    </div>
                    <span id="status-tool-2" class="text-[9px] font-mono font-bold text-rose-600">CUT</span>
                </button>

                <!-- Tool 3: Cellular Stain / Microscope Contrast -->
                <button onclick="sim.toggleTool3()" id="btn-tool-3" class="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg flex items-center justify-between transition cursor-pointer text-left">
                    <div class="flex items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs">
                            <i class="fa-solid fa-eye-dropper"></i>
                        </div>
                        <span id="lbl-tool-3" class="text-[10px] font-bold text-slate-800">Safranin Stain</span>
                    </div>
                    <span id="status-tool-3" class="text-[9px] font-mono font-bold text-slate-500">OFF</span>
                </button>

                <!-- Tool 4: Auto-Run Timeline -->
                <button onclick="sim.toggleAutoRun()" id="btn-tool-4" class="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg flex items-center justify-between transition cursor-pointer text-left">
                    <div class="flex items-center gap-1.5">
                        <div class="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs">
                            <i id="icon-tool-4" class="fa-solid fa-forward"></i>
                        </div>
                        <span id="lbl-tool-4" class="text-[10px] font-bold text-slate-800">Auto-Run 7D</span>
                    </div>
                    <span id="status-tool-4" class="text-[9px] font-mono font-bold text-amber-600">RUN</span>
                </button>
            </div>

            <!-- Inquiry & Quick Presets -->
            <div class="flex items-center justify-between border-b border-slate-200 pb-1 mt-0.5">
                <div class="flex items-center gap-1.5">
                    <i class="fa-regular fa-compass text-blue-600 text-xs"></i>
                    <h2 class="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">INQUIRY & QUICK PRESETS</h2>
                </div>
                <button onclick="sim.setRightTab('cards')" class="text-[10px] font-bold text-blue-600 hover:underline">Theory</button>
            </div>

            <!-- Biological Status Banner -->
            <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        BIOLOGICAL STATUS
                    </span>
                    <span id="status-time-badge" class="text-[9px] font-bold font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">Day 7</span>
                </div>
                <p id="live-status-desc" class="text-[10.5px] text-slate-700 leading-snug">
                    Both onion bulbs are elongating normally in water through active apical division.
                </p>
            </div>

            <!-- 4 Quick Presets Grid -->
            <div class="grid grid-cols-2 gap-1.5">
                <button onclick="sim.applyPreset(1)" class="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition">
                    <div id="preset-title-1" class="text-[10px] font-extrabold text-slate-800">🌱 Intact Growth</div>
                    <div id="preset-sub-1" class="text-[8.5px] text-slate-500 font-medium">Both tips intact</div>
                </button>
                <button onclick="sim.applyPreset(2)" class="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition">
                    <div id="preset-title-2" class="text-[10px] font-extrabold text-slate-800">✂️ Excision Day 3</div>
                    <div id="preset-sub-2" class="text-[8.5px] text-slate-500 font-medium">Cut Jar B 1 cm</div>
                </button>
                <button onclick="sim.applyPreset(3)" class="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition">
                    <div id="preset-title-3" class="text-[10px] font-extrabold text-slate-800">📊 Full 7-Day Comparison</div>
                    <div id="preset-sub-3" class="text-[8.5px] text-slate-500 font-medium">Table 3.1 Data</div>
                </button>
                <button onclick="sim.applyPreset(4)" class="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition">
                    <div id="preset-title-4" class="text-[10px] font-extrabold text-slate-800">🔬 Cell Cross-Section</div>
                    <div id="preset-sub-4" class="text-[8.5px] text-slate-500 font-medium">Meristem Cells</div>
                </button>
            </div>

            <!-- Main Primary Action Button -->
            <button onclick="sim.onPrimaryActionClick()" id="btn-primary-action" class="w-full mt-auto py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98">
                <i class="fa-solid fa-play"></i>
                <span id="btn-action-text">Record Day Reading & Advance</span>
            </button>
        </aside>

        <!-- CENTER PANEL: Main Interactive Simulation Stage -->
        <section id="center-panel" class="glass-panel flex-1 flex flex-col p-2.5 sm:p-3 relative overflow-hidden h-full">
            
            <!-- Floating Zoom Toolbar on Canvas Top-Right -->
            <div class="absolute top-4 right-4 flex items-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-md p-1 gap-1 z-10">
                <button onclick="sim.zoomOut()" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer" title="Zoom Out">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <span id="canvas-zoom-badge" class="px-2 text-xs font-bold text-slate-800 mono-font min-w-[42px] text-center">100x</span>
                <button onclick="sim.zoomIn()" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer" title="Zoom In">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <div class="h-4 w-px bg-slate-200 mx-0.5"></div>
                <button onclick="sim.resetZoom()" class="px-2 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer" title="Reset Zoom & Pan">
                    <i class="fa-solid fa-arrows-rotate mr-1 text-[10px]"></i> Reset
                </button>
            </div>

            <!-- Top Simulation Stage HUD Badge -->
            <div class="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                <div class="bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span id="canvas-hud-title" class="text-xs font-extrabold text-slate-800">
                        Activity 3.1: Onion Root Apical Meristem
                    </span>
                    <span class="text-[9px] font-mono bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                        Interactive 2D Canvas
                    </span>
                </div>
            </div>

            <!-- HTML5 Interactive Canvas -->
            <div class="relative flex-1 w-full min-h-[320px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/80">
                <canvas id="sim-canvas" class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing block"></canvas>
                
                <!-- Dynamic Milestone Notification -->
                <div id="outcome-banner" class="absolute bottom-5 inset-x-5 max-w-lg mx-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg flex items-center justify-between gap-3 transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none z-20">
                    <div class="flex items-center gap-2.5">
                        <div id="outcome-icon-box" class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <i id="outcome-icon" class="fa-solid fa-check"></i>
                        </div>
                        <div>
                            <div id="outcome-title" class="text-xs font-black text-slate-800">Measurement Recorded</div>
                            <div id="outcome-desc" class="text-[10px] text-slate-600">Jar A grew by +0.5 cm. Apical dividing cells remain intact.</div>
                        </div>
                    </div>
                    <button onclick="sim.dismissBanner()" class="text-slate-400 hover:text-slate-700 pointer-events-auto p-1">
                        <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- Bottom Canvas Legend -->
            <div class="flex items-center justify-between pt-2 px-1 text-[10px] font-medium text-slate-500 border-t border-slate-100 mt-2 shrink-0">
                <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                        <span id="leg-1">Jar A (Control)</span>
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        <span id="leg-2">Jar B (Excised Tip)</span>
                    </span>
                    <span class="flex items-center gap-1 hidden sm:flex">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span id="leg-3">Apical Meristem Zone</span>
                    </span>
                </div>
                <div class="text-[9px] font-mono text-slate-400">
                    <i class="fa-solid fa-hand-pointer mr-1"></i> Drag to pan • Scroll to zoom
                </div>
            </div>
        </section>

        <!-- RIGHT PANEL: Notes & Checks (Exact match to Image 1) -->
        <aside id="right-panel" class="glass-panel w-full lg:w-[320px] xl:w-[340px] p-3 lg:p-3.5 flex flex-col gap-2 shrink-0 h-full overflow-y-auto custom-scrollbar hidden lg:flex">
            
            <!-- Panel Header -->
            <div class="border-b border-slate-200 pb-2">
                <h2 class="text-base font-extrabold text-slate-900 tracking-tight mb-2">Notes & Checks</h2>
                
                <!-- Tab Bar with exact labels from Image 1 -->
                <div class="flex items-center gap-3 text-xs font-bold">
                    <button onclick="sim.setRightTab('flow')" id="tab-btn-flow" class="flex items-center gap-1.5 pb-1 text-emerald-600 border-b-2 border-emerald-600 transition cursor-pointer">
                        <i class="fa-regular fa-compass text-emerald-600"></i> Learning Flow
                    </button>
                    <button onclick="sim.setRightTab('cards')" id="tab-btn-cards" class="flex items-center gap-1.5 pb-1 text-slate-500 hover:text-slate-800 border-b-2 border-transparent transition cursor-pointer">
                        <i class="fa-regular fa-book-open"></i> Fact Cards
                    </button>
                    <button onclick="sim.setRightTab('quiz')" id="tab-btn-quiz" class="flex items-center gap-1.5 pb-1 text-slate-500 hover:text-slate-800 border-b-2 border-transparent transition cursor-pointer">
                        <i class="fa-regular fa-circle-check"></i> Check Quiz
                    </button>
                </div>
            </div>

            <!-- TAB CONTENT 1: LEARNING FLOW (Exact match to Image 1) -->
            <div id="panel-flow" class="flex flex-col gap-2.5">
                
                <!-- STEP 1 · OBJECTIVE -->
                <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <div class="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
                        STEP 1 · OBJECTIVE
                    </div>
                    <p id="flow-step1-text" class="text-xs text-slate-700 font-medium leading-relaxed">
                        Distinguish the three meristems: apical (length), lateral (girth), and intercalary (regrowth after cutting).
                    </p>
                </div>

                <!-- STEP 2 · PREDICT HYPOTHESIS -->
                <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <div class="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1.5">
                        STEP 2 · PREDICT HYPOTHESIS
                    </div>
                    <p id="flow-step2-q" class="text-xs font-bold text-slate-800 mb-2.5 leading-snug">
                        Which part of a plant grows when a tree trunk gets thicker?
                    </p>
                    
                    <div id="flow-step2-options" class="space-y-1.5 mb-3">
                        <!-- Populated dynamically via JS -->
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="sim.saveHypothesis()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer">
                            Save Hypothesis
                        </button>
                        <button onclick="sim.skipHypothesis()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer">
                            Skip
                        </button>
                    </div>
                    <div id="flow-hypo-feedback" class="text-[10px] font-bold mt-2 text-emerald-600 hidden">
                        ✓ Hypothesis recorded in lab notebook!
                    </div>
                </div>

                <!-- STEP 3 · INTERACT & EXPERIMENT -->
                <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <div class="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
                        STEP 3 · INTERACT & EXPERIMENT
                    </div>
                    <p class="text-xs text-slate-700 leading-relaxed mb-2 font-medium">
                        Manipulate the simulation controls in the centre stage to gather empirical data and observe anatomical structures.
                    </p>
                    
                    <!-- Live empirical metrics embedded in Step 3 -->
                    <div class="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[10px]">
                        <div class="flex justify-between items-center text-slate-600">
                            <span id="tel-k1-name">Param X:</span>
                            <span id="tel-k1-val" class="font-bold text-slate-900">1.0 cm</span>
                        </div>
                        <div class="flex justify-between items-center text-slate-600">
                            <span id="tel-k2-name">Param Y:</span>
                            <span id="tel-k2-val" class="font-bold text-slate-900">1.0 cm</span>
                        </div>
                        <div class="flex justify-between items-center text-slate-600">
                            <span id="tel-k3-name">Rate:</span>
                            <span id="tel-k3-val" class="font-bold text-blue-700">0.5 cm/d</span>
                        </div>
                        <div class="flex justify-between items-center text-slate-600">
                            <span id="tel-k4-name">State:</span>
                            <span id="tel-k4-val" class="font-bold text-emerald-600">Mitosis</span>
                        </div>
                    </div>
                </div>

                <!-- STEP 4 · SCIENTIFIC EXPLANATION -->
                <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <div class="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
                        STEP 4 · SCIENTIFIC EXPLANATION
                    </div>
                    <p class="text-xs text-slate-700 mb-2 font-medium">
                        Why did this happen? Explain the structure-to-function link:
                    </p>
                    <textarea id="flow-explain-input" rows="3" class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none mb-1.5" placeholder="Type your scientific explanation (min 8 words)..."></textarea>
                    
                    <div class="flex justify-between items-center">
                        <span id="flow-explain-count" class="text-[9.5px] text-slate-400">Min 8 words</span>
                        <button onclick="sim.saveExplanation()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer">
                            Save Explanation
                        </button>
                    </div>
                    <div id="flow-explain-feedback" class="text-[10px] font-bold mt-2 text-emerald-600 hidden">
                        ✓ Scientific explanation recorded!
                    </div>
                </div>
            </div>

            <!-- TAB CONTENT 2: FACT CARDS & TISSUE PRINCIPLES -->
            <div id="panel-cards" class="flex flex-col gap-2.5 hidden">
                <!-- Comparison Cards: Specimen A vs B -->
                <div class="grid grid-cols-2 gap-2">
                    <div class="telemetry-card flex flex-col justify-center border-l-4 border-l-blue-600 p-2.5">
                        <span id="card-label-a" class="text-[9px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">Jar A (Control)</span>
                        <div class="flex items-baseline gap-1">
                            <span id="tel-val-a" class="digital-font text-xl font-black text-blue-950">1.0</span>
                            <span id="tel-unit-a" class="text-[10px] text-blue-600 font-bold">cm</span>
                        </div>
                        <span id="tel-sub-a" class="text-[8.5px] font-bold mt-0.5 text-emerald-600 uppercase tracking-tight">Dividing • +0.5cm/d</span>
                    </div>
                    
                    <div class="telemetry-card flex flex-col justify-center border-l-4 border-l-amber-500 p-2.5">
                        <span id="card-label-b" class="text-[9px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">Jar B (Treatment)</span>
                        <div class="flex items-baseline gap-1">
                            <span id="tel-val-b" class="digital-font text-xl font-black text-amber-950">1.0</span>
                            <span id="tel-unit-b" class="text-[10px] text-amber-600 font-bold">cm</span>
                        </div>
                        <span id="tel-sub-b" class="text-[8.5px] font-bold mt-0.5 text-slate-500 uppercase tracking-tight">Active Growth</span>
                    </div>
                </div>

                <!-- Dynamic SVG Anatomical Profile -->
                <div class="telemetry-card p-2.5">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9.5px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                            <i class="fa-solid fa-microscope text-blue-600"></i>
                            <span id="svg-diag-title">Tissue Profile</span>
                        </span>
                        <span id="svg-diag-tag" class="text-[8.5px] font-bold text-blue-600 font-mono">Apical Zone</span>
                    </div>
                    <div class="flex items-center justify-center p-1 bg-slate-50 rounded-lg border border-slate-100">
                        <svg id="fbd-svg" class="w-full h-24" viewBox="0 0 260 90">
                            <!-- Rendered dynamically via JS -->
                        </svg>
                    </div>
                    <div class="flex justify-around text-[8.5px] font-bold text-slate-500 border-t border-slate-100 pt-1 mt-1" id="svg-labels-row">
                        <span class="text-purple-700">Dividing Cells</span>
                        <span class="text-orange-600">Protective Cap</span>
                        <span class="text-blue-600">Elongation Zone</span>
                    </div>
                </div>

                <!-- NCERT Principle & KaTeX Formula -->
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                    <div class="flex items-center gap-1.5 border-b border-slate-200 pb-1 mb-1.5">
                        <i class="fa-solid fa-book-open text-blue-600 text-xs"></i>
                        <h3 class="text-[9.5px] font-extrabold text-slate-800 uppercase tracking-wider">NCERT Concept Principle</h3>
                    </div>
                    <p class="text-[10.5px] leading-relaxed mb-1.5" id="theory-principle">
                        Growth of plants occurs only in specific localized regions containing <strong>meristematic tissue</strong>.
                    </p>
                    <div class="text-xs text-center my-1.5 font-mono text-blue-800 font-bold" id="theory-formula">
                        $$R = \\frac{\\Delta L}{\\Delta t}$$
                    </div>
                    <div class="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-blue-800 leading-snug font-medium" id="theory-tip">
                        💡 Once the apical tip of Jar B is excised on Day 3, cell division ceases completely!
                    </div>
                </div>
            </div>

            <!-- TAB CONTENT 3: CHECK QUIZ -->
            <div id="panel-quiz" class="flex flex-col gap-2.5 hidden">
                <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                    <div class="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                        <span class="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                            <i class="fa-solid fa-circle-question"></i> QUICK CONCEPT CHECK
                        </span>
                        <span id="quiz-status-badge" class="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">2 Questions</span>
                    </div>

                    <div id="quiz-container" class="space-y-3">
                        <!-- Rendered dynamically via JS -->
                    </div>

                    <button onclick="sim.submitQuiz()" class="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer">
                        Check Answers
                    </button>
                    <div id="quiz-feedback-box" class="mt-2 text-xs font-bold text-center hidden"></div>
                </div>
            </div>

        </aside>

    </main>

    <!-- MAIN SIMULATION ENGINE JAVASCRIPT -->
    <script>
        const MODULE_DATA = {
            M01: {
                title: "NCERT Activity 3.1: Onion Root Apical Meristem",
                sub: "Activity 3.1 • Growth of Roots in Onion Bulbs",
                sec1: "1. EXPERIMENTAL TIMELINE",
                lbl1: "Experiment Day", sym1: "t", min1: 1, max1: 7, step1: 1, def1: 7, unit1: "Day",
                tool1: "Digital Ruler", tool2: "Cut Root Tip", tool3: "Safranin Stain", tool4: "Auto-Run 7D",
                p1: "🌱 Intact Growth", p1Sub: "Both tips intact",
                p2: "✂️ Excision Day 3", p2Sub: "Cut Jar B 1 cm",
                p3: "📊 Full 7-Day Comparison", p3Sub: "Table 3.1 Data",
                p4: "🔬 Cell Cross-Section", p4Sub: "Meristem Cells",
                btnAction: "Record Day Reading & Advance",
                leg1: "Jar A (Control)", leg2: "Jar B (Excised Tip)", leg3: "Apical Meristem Zone",
                cardA: "Jar A (Control)", unitA: "cm", cardB: "Jar B (Treatment)", unitB: "cm",
                status: "Both onion bulbs are elongating normally in water through active apical division.",
                objective: "Distinguish the three meristems: apical (length), lateral (girth), and intercalary (regrowth after cutting).",
                hypoQ: "Which part of a plant grows when a tree trunk gets thicker?",
                hypoOpts: [
                    "A ring-shaped layer of dividing cells inside the stem (cambium)",
                    "The shoot tip at the very top",
                    "The root tip under the ground",
                    "The nodes between the leaves"
                ],
                hypoAns: 0,
                k1: "Day:", k2: "Cut Day:", k3: "Growth Rate:", k4: "State:",
                svgTitle: "Meristem Tissue Profile", svgTag: "Apical Zone",
                svgLabels: ["Dividing Cells", "Protective Cap", "Elongation Zone"],
                principle: "Growth of plants occurs only in specific localized regions containing <strong>meristematic tissue</strong>. Apical meristem divides at tips.",
                formula: "$$R = \\\\frac{\\\\Delta L}{\\\\Delta t}$$",
                tip: "💡 Once the apical tip of Jar B is excised on Day 3, cell division ceases completely!",
                quiz: [
                    {
                        q: "Why do the roots in Jar B stop elongating after excision on Day 3?",
                        opts: ["Apical meristematic tissue was removed", "Water ceased entering the bulb", "Root cap degraded", "Chloroplasts died"],
                        ans: 0,
                        expl: "Apical meristems at root tips drive elongation. Cutting removes dividing cells."
                    },
                    {
                        q: "Which stain is used to observe onion root meristematic chromosomes?",
                        opts: ["Safranin / Acetocarmine", "Methylene Blue", "Iodine solution", "Crystal Violet"],
                        ans: 0,
                        expl: "Safranin/acetocarmine stains the dense nuclei and actively dividing chromosomes."
                    }
                ]
            },
            M02: {
                title: "M02: Meristem Locator",
                sub: "Apical (Length) • Lateral (Girth/Cambium) • Intercalary (Nodes)",
                sec1: "1. GROWTH REGIONS INSPECTOR",
                lbl1: "Zone Selector (1-4)", sym1: "Z", min1: 1, max1: 4, step1: 1, def1: 1, unit1: "Zone",
                tool1: "Cell Magnifier", tool2: "Excise Tip", tool3: "Cambium Stain", tool4: "Cycle Zones",
                p1: "🌱 Shoot Tip", p1Sub: "Apical Apex",
                p2: "🌿 Leaf Node", p2Sub: "Intercalary",
                p3: "🪵 Trunk Girth", p3Sub: "Lateral Cambium",
                p4: "🥕 Root Tip", p4Sub: "Root Apical",
                btnAction: "Inspect Cell Microstructure",
                leg1: "Shoot Tip (Apical)", leg2: "Nodes (Intercalary)", leg3: "Cambium (Lateral)",
                cardA: "Zone Cell Density", unitA: "cell/mm²", cardB: "Mitotic Index", unitB: "%",
                status: "Apical, lateral, and intercalary meristems coordinate overall plant architecture.",
                objective: "Identify the anatomical positions and distinct cellular functions of apical, lateral, and intercalary meristems.",
                hypoQ: "What enables grass blades to rapidly regrow after being grazed by herbivores?",
                hypoOpts: [
                    "Intercalary meristem located at the base of leaves and internodes",
                    "Root apical meristem pumping sap upward",
                    "Dead cork cells absorbing sunlight",
                    "Xylem vessels generating new leaves"
                ],
                hypoAns: 0,
                k1: "Selected:", k2: "Type:", k3: "Function:", k4: "Cell Size:",
                svgTitle: "Meristem Zonation Map", svgTag: "Plant Axis",
                svgLabels: ["Apical Meristem", "Intercalary", "Lateral Cambium"],
                principle: "Meristems are classified by location: Apical increases length, Lateral increases diameter, Intercalary elongates internodes.",
                formula: "$$Girth = G_0 + 2\\pi \\cdot \\Delta r$$",
                tip: "💡 Intercalary meristems at node bases allow grasses to regenerate rapidly after grazing!",
                quiz: [
                    {
                        q: "Which meristem is responsible for the increase in girth of a plant stem?",
                        opts: ["Lateral meristem (Cambium)", "Apical meristem", "Intercalary meristem", "Parenchyma"],
                        ans: 0,
                        expl: "Lateral meristems (cambium) divide tangentially to produce secondary xylem and phloem, increasing girth."
                    },
                    {
                        q: "Where is intercalary meristem found?",
                        opts: ["At the base of leaves or internodes", "At shoot tips only", "In root hairs", "In the bark layer"],
                        ans: 0,
                        expl: "Intercalary meristem is located at internodes and leaf bases, enabling rapid leaf expansion."
                    }
                ]
            },
            M03: {
                title: "M03: Tree Rings and Annual Growth",
                sub: "Secondary Growth • Vascular Cambium Activity • Springwood & Autumnwood",
                sec1: "1. CHRONOLOGICAL AGE (YEARS)",
                lbl1: "Tree Age", sym1: "T", min1: 1, max1: 25, step1: 1, def1: 12, unit1: "Years",
                tool1: "Core Borer", tool2: "Dendro-Ruler", tool3: "Lignin Stain", tool4: "Auto-Age",
                p1: "🌱 Sapling (3 Yr)", p1Sub: "Early rings",
                p2: "🌳 Young Tree (10 Yr)", p2Sub: "Vigorous cambium",
                p3: "🌲 Mature Trunk (20 Yr)", p3Sub: "Clear early/late wood",
                p4: "🪵 Old Wood (25 Yr)", p4Sub: "Heartwood density",
                btnAction: "Count Annual Rings & Calibrate",
                leg1: "Springwood (Wide)", leg2: "Autumnwood (Dense)", leg3: "Bark & Phloem",
                cardA: "Annual Rings", unitA: "rings", cardB: "Trunk Diameter", unitB: "cm",
                status: "Vascular cambium produces wide xylary elements in spring and narrow dense cells in winter.",
                objective: "Observe how seasonal variation in vascular cambium activity forms distinct concentric annual rings.",
                hypoQ: "Why does springwood appear lighter and wider than autumnwood in a tree cross-section?",
                hypoOpts: [
                    "Cambium produces larger vessels with wider cavities during active spring growth",
                    "Springwood has more dead cells and air bubbles",
                    "Leaves fall in spring causing wood to fade",
                    "Phloem replaces xylem during cold weather"
                ],
                hypoAns: 0,
                k1: "Age (Yr):", k2: "Ring Count:", k3: "Heartwood %:", k4: "Weather:",
                svgTitle: "Dendrochronology Cross-Section", svgTag: "Annual Ring",
                svgLabels: ["Springwood (Early)", "Autumnwood (Late)", "Vascular Cambium"],
                principle: "Each annual ring comprises one light-colored ring of springwood and one dark, dense ring of autumnwood.",
                formula: "$$Age = N_{rings} = \\sum_{y=1}^{T} 1$$",
                tip: "💡 Counting concentric rings gives the tree's precise chronological age in temperate climates!",
                quiz: [
                    {
                        q: "What causes the alternating light and dark bands in tree trunks?",
                        opts: ["Seasonal cambial activity: wide vessels in spring, dense narrow vessels in winter", "Bark shedding each season", "Fungal infection cycles", "Alternating day and night temperatures"],
                        ans: 0,
                        expl: "Favorable spring conditions produce wide, thin-walled vessels; autumn produces narrow, thick-walled elements."
                    },
                    {
                        q: "Which tissue constitutes the secondary xylem of a tree?",
                        opts: ["Wood", "Bark", "Pith", "Epidermis"],
                        ans: 0,
                        expl: "Wood is secondary xylem produced toward the interior by the vascular cambium."
                    }
                ]
            },
            M04: {
                title: "M04: Grass and Hedge Regrowth",
                sub: "Herbivory Simulation • Intercalary Meristem Activation",
                sec1: "1. POST-CUT TIMELINE (HOURS)",
                lbl1: "Regrowth Hours", sym1: "t_h", min1: 0, max1: 72, step1: 3, def1: 24, unit1: "Hours",
                tool1: "Lawn Mower", tool2: "Hedge Shears", tool3: "Auxin Spray", tool4: "Auto-Time",
                p1: "✂️ Just Mowed (0 h)", p1Sub: "Tips excised",
                p2: "🌱 Emergence (24 h)", p2Sub: "Basal elongation",
                p3: "🌿 Rapid Regrowth (48 h)", p3Sub: "Intercalary active",
                p4: "🌾 Restored Height (72 h)", p4Sub: "Full biomass",
                btnAction: "Mow Grass & Initiate Regrowth",
                leg1: "Grass Blade", leg2: "Cut Horizon", leg3: "Intercalary Basal Zone",
                cardA: "Blade Height", unitA: "cm", cardB: "Regrowth Rate", unitB: "mm/h",
                status: "Intercalary meristem cells divide rapidly to regenerate lost shoot lamina without apical tips.",
                objective: "Demonstrate that grasses survive grazing and mowing because their meristem resides at the base of the blade.",
                hypoQ: "What happens if a lawn is mowed down to ground level below the intercalary meristem?",
                hypoOpts: [
                    "Regrowth is permanently prevented because the basal meristem is destroyed",
                    "The grass immediately doubles in thickness",
                    "Intercalary meristem migrates to the roots",
                    "No effect on normal regrowth"
                ],
                hypoAns: 0,
                k1: "Elapsed (h):", k2: "Cutting Ht:", k3: "Regrown:", k4: "Status:",
                svgTitle: "Blade Morphology", svgTag: "Intercalary",
                svgLabels: ["Blade Lamina", "Intercalary Zone", "Root Crown"],
                principle: "Intercalary meristems are retained at the base of grass blades, allowing regeneration after herbivore defoliation.",
                formula: "$$H(t) = H_{cut} + v_{intercalary} \\cdot t$$",
                tip: "💡 Unlike dicot shoots with terminal apical buds, grasses have basal meristems that escape lawn mower blades!",
                quiz: [
                    {
                        q: "Why does grass continue to grow after being mowed, while tomato shoots stop if decapitated?",
                        opts: ["Grass has basal intercalary meristems, whereas tomato depends on terminal apical meristems", "Grass absorbs nitrogen from air", "Tomato roots do not absorb water", "Grass leaves do not need chlorophyll"],
                        ans: 0,
                        expl: "Intercalary meristem located below the cutting level continues dividing and pushing the blade upward."
                    },
                    {
                        q: "Intercalary meristem is derived from:",
                        opts: ["Apical meristem separated during organ development", "Lateral cambium", "Permanent collenchyma", "Sclerenchyma"],
                        ans: 0,
                        expl: "Intercalary meristems are portions of apical meristem left behind as the plant axis elongates."
                    }
                ]
            },
            M05: {
                title: "M05: Plant Tissue Microscope",
                sub: "Simple Permanent Tissues • Parenchyma, Collenchyma, Sclerenchyma",
                sec1: "1. MICROSCOPE MAGNIFICATION",
                lbl1: "Magnification (x)", sym1: "M", min1: 40, max1: 400, step1: 40, def1: 100, unit1: "x",
                tool1: "Parenchyma Slide", tool2: "Collenchyma Slide", tool3: "Sclerenchyma Slide", tool4: "Fine Focus",
                p1: "🍃 Parenchyma (Leaf)", p1Sub: "Thin wall, spaces",
                p2: "🌿 Collenchyma (Stem)", p2Sub: "Corner thickenings",
                p3: "🥥 Sclerenchyma (Husk)", p3Sub: "Lignified dead cells",
                p4: "🔬 400x High Power", p4Sub: "Cell wall pits",
                btnAction: "Switch Specimen Slide",
                leg1: "Cell Wall (Cellulose)", leg2: "Lignin / Pectin Corner", leg3: "Central Lumen",
                cardA: "Wall Thickness", unitA: "µm", cardB: "Intercellular Space", unitB: "µm²",
                status: "Parenchyma cells are unspecialized with thin cellulose walls; sclerenchyma cells are heavily lignified and dead at maturity.",
                objective: "Compare the cell wall compositions, intercellular spaces, and living states of simple permanent tissues.",
                hypoQ: "Which plant tissue provides flexible mechanical support to young stems without breaking during high winds?",
                hypoOpts: [
                    "Collenchyma with pectin corner thickenings",
                    "Dead sclerenchyma fibers",
                    "Storage parenchyma with large intercellular spaces",
                    "Aerenchyma in aquatic leaves"
                ],
                hypoAns: 0,
                k1: "Tissue Type:", k2: "Living State:", k3: "Wall Deposition:", k4: "Lumen Size:",
                svgTitle: "Cross-Section Comparison", svgTag: "Simple Permanent",
                svgLabels: ["Parenchyma", "Collenchyma", "Sclerenchyma"],
                principle: "Parenchyma has thin cellulose walls. Collenchyma has pectin at corners. Sclerenchyma has thick lignified walls with no intercellular spaces.",
                formula: "$$\\text{Mechanical Strength} \\propto \\text{Lignin Thickness}$$",
                tip: "💡 Coconut husk consists entirely of dead sclerenchymatous fibers with narrow lumens and lignified walls!",
                quiz: [
                    {
                        q: "Which tissue consists of dead cells with narrow lumen and thick lignified secondary walls?",
                        opts: ["Sclerenchyma", "Parenchyma", "Collenchyma", "Chlorenchyma"],
                        ans: 0,
                        expl: "Sclerenchyma cells lose their protoplasts at maturity, leaving thick lignified walls for mechanical support."
                    },
                    {
                        q: "What type of parenchyma contains chlorophyll and performs photosynthesis?",
                        opts: ["Chlorenchyma", "Aerenchyma", "Sclerenchyma", "Collenchyma"],
                        ans: 0,
                        expl: "Chlorenchyma is chloroplast-rich parenchyma found in mesophyll layers of leaves."
                    }
                ]
            },
            M06: {
                title: "M06: Xylem and Phloem Transport",
                sub: "Complex Permanent Tissues • Water vs Food Translocation",
                sec1: "1. TRANSPIRATION RATE (%)",
                lbl1: "Transpiration Pull", sym1: "E", min1: 10, max1: 100, step1: 5, def1: 50, unit1: "%",
                tool1: "Eosin Red Dye", tool2: "Aphid Stylet", tool3: "Girdling Knife", tool4: "Flow Pulse",
                p1: "💧 Normal Day Transpiration", p1Sub: "Xylem flow upward",
                p2: "☀️ High Heat Transpiration", p2Sub: "Maximum ascent",
                p3: "🌙 Night Transport", p3Sub: "Phloem dominates",
                p4: "🩸 Girdling Ring Experiment", p4Sub: "Phloem blocked",
                btnAction: "Inject Fluorescent Tracer",
                leg1: "Xylem (Water + Minerals)", leg2: "Phloem (Sucrose + AAs)", leg3: "Tracheary Elements",
                cardA: "Ascent of Sap", unitA: "cm/h", cardB: "Phloem Flow", unitB: "cm/h",
                status: "Xylem transports water unidirectionally via transpiration pull; phloem transports food bidirectionally via active translocation.",
                objective: "Trace the unidirectional flow of water in xylem vessels and the bidirectional flow of organic solutes in phloem sieve tubes.",
                hypoQ: "What will happen to a woody branch if a ring of bark including phloem is removed (girdling)?",
                hypoOpts: [
                    "Food accumulates above the cut causing swelling, while roots eventually starve",
                    "Leaves immediately wilt and dry out",
                    "Water flow stops completely in the xylem",
                    "The tree produces larger fruit below the cut"
                ],
                hypoAns: 0,
                k1: "Xylem Flow:", k2: "Phloem Flow:", k3: "Direction:", k4: "Energy Req:",
                svgTitle: "Vascular Bundle Architecture", svgTag: "Complex Tissues",
                svgLabels: ["Xylem Vessel", "Sieve Tube", "Companion Cell"],
                principle: "Xylem (tracheids, vessels, xylem parenchyma, xylem fibers) transports water. Phloem (sieve tubes, companion cells, phloem parenchyma, fibers) transports food.",
                formula: "$$J_v = -L_p \\cdot (\\Delta P - \\sigma \\Delta \\pi)$$",
                tip: "💡 Xylem transport is driven by passive transpiration pull, whereas phloem translocation requires ATP energy!",
                quiz: [
                    {
                        q: "Which element of phloem is nucleated and regulates sieve tube transport?",
                        opts: ["Companion cell", "Sieve tube element", "Phloem fiber", "Xylem vessel"],
                        ans: 0,
                        expl: "Mature sieve tube elements lack nuclei; adjacent companion cells provide metabolic support through plasmodesmata."
                    },
                    {
                        q: "Which xylem component is the only living cell type?",
                        opts: ["Xylem parenchyma", "Tracheids", "Xylem vessels", "Xylem fibers"],
                        ans: 0,
                        expl: "Xylem parenchyma cells are thin-walled, living cells that store starch and fat."
                    }
                ]
            },
            M07: {
                title: "M07: Plant Epidermal Tissue & Stomata",
                sub: "Protective Tissue • Epidermis, Guard Cells, Cuticle & Transpiration",
                sec1: "1. STOMATAL APERTURE (%)",
                lbl1: "Pore Opening", sym1: "A_s", min1: 0, max1: 100, step1: 5, def1: 75, unit1: "%",
                tool1: "Sunlight On/Off", tool2: "K+ Ion Pump", tool3: "Cobalt Paper", tool4: "Peel Stoma",
                p1: "☀️ Bright Sun (Open)", p1Sub: "High transpiration",
                p2: "⛅ Diffuse Light (Half)", p2Sub: "Balanced gas exchange",
                p3: "🌙 Night (Closed)", p3Sub: "Water conserved",
                p4: "🌵 Desert Xerophyte", p4Sub: "Sunken stomata",
                btnAction: "Toggle Light & Water Regimen",
                leg1: "Epidermal Cells", leg2: "Kidney Guard Cells", leg3: "Stomatal Pore",
                cardA: "Stomatal Pore Width", unitA: "µm", cardB: "Transpiration Loss", unitB: "mg/h",
                status: "Guard cells swell when water enters, bending outward due to thick inner walls and opening the stomatal aperture.",
                objective: "Examine how guard cell turgidity regulates stomatal opening for gas exchange and transpirational cooling.",
                hypoQ: "Why do stomata close during water stress in hot afternoons?",
                hypoOpts: [
                    "Guard cells lose water, lose turgidity, and the thick inner walls relax shut",
                    "Epidermal cells expand and crush the pore",
                    "Cuticle melts and seals the opening",
                    "Chloroplasts inside guard cells absorb the pore"
                ],
                hypoAns: 0,
                k1: "Aperture:", k2: "Guard Cell Turgor:", k3: "Transpiration:", k4: "State:",
                svgTitle: "Stomatal Apparatus", svgTag: "Epidermal Complex",
                svgLabels: ["Guard Cell", "Stomatal Pore", "Subsidiary Cell"],
                principle: "The outer epidermal layer is covered with waxy cutin. Stomata flanked by kidney-shaped guard cells control transpirational loss.",
                formula: "$$E = g_s \\cdot (C_{leaf} - C_{air})$$",
                tip: "💡 Monocot grasses possess dumbbell-shaped guard cells, whereas dicot leaves have kidney-shaped guard cells!",
                quiz: [
                    {
                        q: "What is the primary substance making up the desert plant cuticle to prevent desiccation?",
                        opts: ["Cutin", "Cellulose", "Lignin", "Pectin"],
                        ans: 0,
                        expl: "Cutin is a waxy, waterproof chemical coating the aerial epidermis of plants."
                    },
                    {
                        q: "What shape are guard cells in dicotyledonous leaves?",
                        opts: ["Kidney-shaped", "Dumbbell-shaped", "Spherical", "Hexagonal"],
                        ans: 0,
                        expl: "Dicot guard cells are kidney- or bean-shaped with differentially thickened inner walls."
                    }
                ]
            },
            M08: {
                title: "M08: Epithelial Tissue Types",
                sub: "Animal Protective Coverings • Squamous, Cuboidal, Columnar, Ciliated",
                sec1: "1. EPITHELIAL TYPE SELECTOR",
                lbl1: "Tissue Type (1-4)", sym1: "E_t", min1: 1, max1: 4, step1: 1, def1: 1, unit1: "Type",
                tool1: "Basement Membrane", tool2: "Cilia Action", tool3: "Mucus Secretion", tool4: "Switch Organ",
                p1: "🫁 Squamous (Alveoli)", p1Sub: "Diffusion boundary",
                p2: "🫘 Cuboidal (Kidney)", p2Sub: "Secretion & absorption",
                p3: "🫀 Columnar (Intestine)", p3Sub: "Microvilli absorption",
                p4: "🫁 Ciliated (Trachea)", p4Sub: "Mucus propulsion",
                btnAction: "Trigger Epithelial Micro-Motion",
                leg1: "Epithelial Cells", leg2: "Basement Membrane", leg3: "Connective Base",
                cardA: "Epithelial Thickness", unitA: "µm", cardB: "Diffusion Rate", unitB: "mol/s",
                status: "Epithelial tissues form continuous sheets resting on an extracellular fibrous basement membrane.",
                objective: "Correlate the cellular shapes of squamous, cuboidal, columnar, and ciliated epithelia with their physiological functions.",
                hypoQ: "Which epithelial tissue lines the lung alveoli where ultra-thin diffusion of oxygen and CO2 occurs?",
                hypoOpts: [
                    "Simple squamous epithelium",
                    "Stratified keratinized epithelium",
                    "Columnar ciliated epithelium",
                    "Glandular cuboidal epithelium"
                ],
                hypoAns: 0,
                k1: "Tissue:", k2: "Location:", k3: "Function:", k4: "Basement:",
                svgTitle: "Epithelial Stratification", svgTag: "Animal Tissue",
                svgLabels: ["Cellular Sheet", "Basement Membrane", "Underlying Tissue"],
                principle: "Epithelium has tightly packed cells with almost no intercellular matrix, resting upon a basement membrane.",
                formula: "$$Diffusion \\propto \\frac{\\text{Surface Area}}{\\text{Membrane Thickness}}$$",
                tip: "💡 Cilia on respiratory epithelium beat synchronously to sweep dust particles trapped in mucus out of the airways!",
                quiz: [
                    {
                        q: "Which epithelium forms the inner lining of the mouth and esophagus?",
                        opts: ["Stratified squamous epithelium", "Simple columnar epithelium", "Ciliated columnar epithelium", "Pseudostratified epithelium"],
                        ans: 0,
                        expl: "Stratified squamous epithelium contains multiple layers to resist mechanical abrasion during chewing and swallowing."
                    },
                    {
                        q: "What rests directly beneath every epithelial layer?",
                        opts: ["Extracellular basement membrane", "Dense bone tissue", "Striated muscle", "Myelin sheath"],
                        ans: 0,
                        expl: "The basement membrane anchors epithelial sheets to the underlying connective tissue."
                    }
                ]
            },
            M09: {
                title: "M09: Blood Components & Centrifuge",
                sub: "Fluid Connective Tissue • Plasma, RBCs, WBCs & Platelets",
                sec1: "1. CENTRIFUGE VELOCITY (RPM)",
                lbl1: "Centrifuge Speed", sym1: "RPM", min1: 500, max1: 5000, step1: 250, def1: 3000, unit1: "RPM",
                tool1: "Spin Centrifuge", tool2: "Blood Smear", tool3: "Leishman Stain", tool4: "Hematocrit Tube",
                p1: "🩸 Whole Blood (0 RPM)", p1Sub: "Uniform suspension",
                p2: "🧪 Partial Spin (1500 RPM)", p2Sub: "Phase separation",
                p3: "🏆 Full Separation (3000 RPM)", p3Sub: "55% Plasma, 45% Formed",
                p4: "🔬 High-Power Smear", p4Sub: "RBC biconcave disks",
                btnAction: "Spin Blood Centrifuge Tube",
                leg1: "Plasma (55%)", leg2: "Buffy Coat (WBC+Plt <1%)", leg3: "Packed RBCs (45%)",
                cardA: "Plasma Volume", unitA: "%", cardB: "Hematocrit (RBC)", unitB: "%",
                status: "Blood consists of a fluid matrix called plasma containing suspended erythrocytes, leukocytes, and thrombocytes.",
                objective: "Separate whole blood into plasma, buffy coat, and packed red blood cells via centrifugal sedimentation.",
                hypoQ: "What gives mammalian red blood cells their characteristic biconcave shape and high oxygen-binding capacity?",
                hypoOpts: [
                    "Absence of a nucleus at maturity maximizes space for hemoglobin molecules",
                    "Presence of multiple giant nuclei",
                    "Thick cellulose outer wall",
                    "Presence of flagella"
                ],
                hypoAns: 0,
                k1: "Plasma Fraction:", k2: "RBC Fraction:", k3: "Buffy Coat:", k4: "Matrix State:",
                svgTitle: "Centrifuged Blood Column", svgTag: "Hematology",
                svgLabels: ["Plasma Layer (55%)", "Buffy Coat (<1%)", "Erythrocytes (45%)"],
                principle: "Blood is fluid connective tissue. Plasma carries salts, hormones, and proteins; RBCs transport oxygen; WBCs defend; platelets clot.",
                formula: "$$\\text{Hematocrit} = \\frac{V_{RBC}}{V_{Total}} \\times 100\\%$$",
                tip: "💡 Mature mammalian RBCs lack nuclei, mitochondria, and endoplasmic reticulum to pack maximum hemoglobin!",
                quiz: [
                    {
                        q: "Which cell fragment in blood is essential for coagulation and blood clotting?",
                        opts: ["Platelets (Thrombocytes)", "Erythrocytes", "Monocytes", "Eosinophils"],
                        ans: 0,
                        expl: "Platelets release thromboplastin to initiate the clotting cascade and prevent hemorrhage."
                    },
                    {
                        q: "What percentage of whole human blood does fluid plasma constitute?",
                        opts: ["Approx 55%", "Approx 20%", "Approx 75%", "Approx 45%"],
                        ans: 0,
                        expl: "Plasma forms roughly 55% of total blood volume; erythrocytes form 44%, and buffy coat forms <1%."
                    }
                ]
            },
            M10: {
                title: "M10: Connective Tissue (Areolar, Bone, Tendon)",
                sub: "Supportive & Dense Connective Tissues • Matrix & Fibers",
                sec1: "1. TENSILE LOAD (NEWTONS)",
                lbl1: "Tension Force", sym1: "F", min1: 0, max1: 100, step1: 5, def1: 30, unit1: "N",
                tool1: "Areolar Sample", tool2: "Adipose Sample", tool3: "Tendon Fiber", tool4: "Bone Osteon",
                p1: "🧽 Areolar Tissue", p1Sub: "Subcutaneous cushion",
                p2: "🧈 Adipose Tissue", p2Sub: "Fat storage globule",
                p3: "💪 Tendon & Ligament", p3Sub: "Dense fibrous matrix",
                p4: "🦴 Bone & Cartilage", p4Sub: "Rigid calcium matrix",
                btnAction: "Apply Tensile Strain to Fibers",
                leg1: "Collagen Fibers (White)", leg2: "Elastin Fibers (Yellow)", leg3: "Fibroblast Cells",
                cardA: "Fiber Stress", unitA: "MPa", cardB: "Tensile Strain", unitB: "%",
                status: "Connective tissues feature widely spaced cells embedded in an intercellular matrix that may be jelly-like, fluid, dense, or rigid.",
                objective: "Compare loose areolar, adipose, dense regular tendon/ligament, and skeletal bone/cartilage matrix architectures.",
                hypoQ: "What connects skeletal muscle firmly to bone and withstands extreme tensile pull?",
                hypoOpts: [
                    "Tendon (dense regular collagen fibers)",
                    "Ligament (elastic connective tissue)",
                    "Areolar loose tissue",
                    "Adipose tissue"
                ],
                hypoAns: 0,
                k1: "Tissue Type:", k2: "Matrix:", k3: "Fibers:", k4: "Flexibility:",
                svgTitle: "Connective Matrix Architecture", svgTag: "Histology",
                svgLabels: ["Collagen Bundles", "Matrix Ground Substance", "Embedded Cells"],
                principle: "Tendons join muscle to bone with great strength but limited flexibility. Ligaments join bone to bone and are highly elastic.",
                formula: "$$\\text{Stress } \\sigma = \\frac{F}{A}, \\quad \\text{Strain } \\varepsilon = \\frac{\\Delta L}{L_0}$$",
                tip: "💡 Bone matrix is composed of hard calcium and phosphorus compounds, whereas cartilage has sugar and protein matrix!",
                quiz: [
                    {
                        q: "Which connective tissue connects two bones together at a movable joint?",
                        opts: ["Ligament", "Tendon", "Cartilage", "Areolar tissue"],
                        ans: 0,
                        expl: "Ligaments connect bone to bone; they contain considerable strength and high elasticity."
                    },
                    {
                        q: "Adipose tissue stores fat in cells known as:",
                        opts: ["Adipocytes", "Osteocytes", "Chondrocytes", "Fibroblasts"],
                        ans: 0,
                        expl: "Adipocytes store fat globules beneath the skin, acting as an insulating thermal blanket."
                    }
                ]
            },
            M11: {
                title: "M11: Muscle Tissue Comparison",
                sub: "Striated (Skeletal) • Unstriated (Smooth) • Cardiac Muscle",
                sec1: "1. CONTRACTION RATE (BPM)",
                lbl1: "Contraction Speed", sym1: "f_c", min1: 30, max1: 140, step1: 5, def1: 72, unit1: "BPM",
                tool1: "Skeletal Fiber", tool2: "Smooth Spindle", tool3: "Cardiac Intercalated", tool4: "ATP Trigger",
                p1: "💪 Skeletal (Voluntary)", p1Sub: "Striated, multinucleate",
                p2: "🫀 Cardiac (Heart)", p2Sub: "Branched, rhythmic",
                p3: "🫁 Smooth (Involuntary)", p3Sub: "Spindle-shaped, uninucleate",
                p4: "⚡ Fast Tetanic Twitch", p4Sub: "High frequency",
                btnAction: "Trigger Synchronized Contraction",
                leg1: "Actin & Myosin Striations", leg2: "Intercalated Discs", leg3: "Peripheral Nuclei",
                cardA: "Force Output", unitA: "mN", cardB: "Cycle Frequency", unitB: "Hz",
                status: "Skeletal muscles are voluntary and striated; smooth muscles are involuntary and unstriated; cardiac muscles branch with rhythmic endurance.",
                objective: "Contrast the cytological striations, branching, nuclei, and voluntary control of the three muscular tissue classes.",
                hypoQ: "Which muscle tissue never experiences muscular fatigue under normal physiological conditions?",
                hypoOpts: [
                    "Cardiac muscle of the heart",
                    "Skeletal muscle of the biceps",
                    "Smooth muscle of the stomach",
                    "Tongue muscles"
                ],
                hypoAns: 0,
                k1: "Muscle Class:", k2: "Striations:", k3: "Control:", k4: "Fatigue:",
                svgTitle: "Myofibril Architecture", svgTag: "Muscular Tissue",
                svgLabels: ["Skeletal (Striped)", "Smooth (Spindle)", "Cardiac (Branched)"],
                principle: "Muscles contain contractile proteins (actin and myosin) that slide past one another to cause contraction and movement.",
                formula: "$$F_{contractile} = \\kappa \\cdot [\\text{Ca}^{2+}] \\cdot \\cos(\\theta)$$",
                tip: "💡 Cardiac muscle fibers are interconnected by intercalated discs with gap junctions that allow electrical waves to spread instantly!",
                quiz: [
                    {
                        q: "Which muscle tissue features multinucleated, unbranched cylindrical fibers with dark and light bands?",
                        opts: ["Striated / Skeletal muscle", "Smooth muscle", "Cardiac muscle", "Visceral muscle"],
                        ans: 0,
                        expl: "Skeletal muscles are multinucleated syncytia with prominent actin-myosin striations."
                    },
                    {
                        q: "In which internal organ is smooth involuntary muscle predominantly located?",
                        opts: ["Alimentary canal and stomach walls", "Biceps of upper arm", "Pectoralis major", "Hamstrings"],
                        ans: 0,
                        expl: "Smooth muscles line internal organs, blood vessels, and the gastrointestinal tract to power peristalsis."
                    }
                ]
            },
            M12: {
                title: "M12: Neuron and Signal Pathway",
                sub: "Nervous Tissue • Cyton, Dendrites, Axon & Synaptic Action Potential",
                sec1: "1. STIMULUS VOLTAGE (mV)",
                lbl1: "Stimulus Voltage", sym1: "V_s", min1: 10, max1: 100, step1: 5, def1: 55, unit1: "mV",
                tool1: "Fire Action Potential", tool2: "Myelin Sheath Toggle", tool3: "Synapse Zoom", tool4: "Electrode Pulse",
                p1: "⚡ Threshold Trigger (55 mV)", p1Sub: "Action potential fires",
                p2: "🛡️ Myelinated Axon", p2Sub: "Saltatory fast leap",
                p3: "🐢 Unmyelinated Axon", p3Sub: "Continuous slow wave",
                p4: "🔬 Synaptic Cleft", p4Sub: "Neurotransmitter release",
                btnAction: "Fire Nerve Impulse Along Axon",
                leg1: "Dendrites & Cyton", leg2: "Myelinated Axon", leg3: "Nerve Terminal / Synapse",
                cardA: "Membrane Potential", unitA: "mV", cardB: "Conduction Velocity", unitB: "m/s",
                status: "Nerve cells (neurons) receive impulses via dendrites, process signals in the cyton, and conduct rapid electrical impulses along the axon.",
                objective: "Follow the unidirectional transmission of an electrical nerve impulse from dendrite through cyton and axon to synapse.",
                hypoQ: "What chemical substance bridges the microscopic physical gap (synapse) between two adjacent neurons?",
                hypoOpts: [
                    "Neurotransmitters (e.g. acetylcholine)",
                    "Hemoglobin molecules",
                    "Myelin lipid droplets",
                    "Calcium carbonate crystals"
                ],
                hypoAns: 0,
                k1: "Potential:", k2: "Speed:", k3: "Node of Ranvier:", k4: "State:",
                svgTitle: "Neuron Cytology Diagram", svgTag: "Neural Axis",
                svgLabels: ["Dendrites", "Cell Body (Cyton)", "Myelinated Axon"],
                principle: "A neuron consists of a cell body with nucleus and cytoplasm, from which long thin hair-like parts (axon and dendrites) arise.",
                formula: "$$v_{saltatory} \\propto d_{axon} \\cdot \\text{Myelin Factor}$$",
                tip: "💡 Myelin sheaths act as electrical insulation, forcing impulses to leap between Nodes of Ranvier at speeds up to 120 m/s!",
                quiz: [
                    {
                        q: "Which part of a neuron receives incoming electrical signals from sensory receptors or adjacent cells?",
                        opts: ["Dendrites", "Axon terminals", "Myelin sheath", "Schwann cells"],
                        ans: 0,
                        expl: "Dendrites are branching extensions that receive incoming electrochemical signals and convey them to the soma."
                    },
                    {
                        q: "What is the specialized junction between the axon tip of one neuron and the dendrite of the next?",
                        opts: ["Synapse", "Sarcomere", "Osteon", "Intercalated disc"],
                        ans: 0,
                        expl: "The synapse is the functional microscopic gap across which neurotransmitters diffuse."
                    }
                ]
            },
            M13: {
                title: "M13: Muscle-Tendon-Bone Movement",
                sub: "Musculoskeletal Biomechanics • Antagonistic Biceps & Triceps Levers",
                sec1: "1. ELBOW FLEXION ANGLE (°)",
                lbl1: "Joint Flexion Angle", sym1: "\\theta", min1: 30, max1: 160, step1: 5, def1: 90, unit1: "°",
                tool1: "Flex Biceps", tool2: "Extend Triceps", tool3: "Tendon Stress", tool4: "Hold Dumbbell",
                p1: "💪 Full Flexion (35°)", p1Sub: "Biceps maximum shorten",
                p2: "📐 Right Angle (90°)", p2Sub: "Maximum torque load",
                p3: "✋ Full Extension (160°)", p3Sub: "Triceps contracted",
                p4: "🏋️ Heavy Load (5 kg)", p4Sub: "Tendon tension doubled",
                btnAction: "Toggle Antagonistic Arm Movement",
                leg1: "Biceps (Flexor)", leg2: "Triceps (Extensor)", leg3: "Tendon Attachments",
                cardA: "Biceps Tension", unitA: "N", cardB: "Joint Torque", unitB: "N·m",
                status: "Muscles can only pull, not push; hence bones move through coordinated antagonistic pairs of flexors and extensors.",
                objective: "Observe how antagonistic muscle pairs contract and relax alternately to articulate joints via non-elastic tendons.",
                hypoQ: "When your forearm is flexed upward toward your shoulder, what are the states of the biceps and triceps muscles?",
                hypoOpts: [
                    "Biceps contracts and shortens; triceps relaxes and elongates",
                    "Both biceps and triceps contract simultaneously",
                    "Triceps contracts while biceps relaxes",
                    "Both muscles remain completely relaxed"
                ],
                hypoAns: 0,
                k1: "Flexion Angle:", k2: "Biceps Length:", k3: "Triceps Length:", k4: "Lever Class:",
                svgTitle: "Arm Lever Biomechanics", svgTag: "Class 3 Lever",
                svgLabels: ["Biceps Muscle", "Elbow Fulcrum", "Radius/Ulna Arm"],
                principle: "Skeletal muscles act on bones across synovial joints as Class 3 levers where effort is applied between fulcrum and resistance.",
                formula: "$$\\tau = F_{muscle} \\cdot r_{\\perp} = m \\cdot g \\cdot d$$",
                tip: "💡 Tendons transmit muscle force with almost zero energy loss because collagen fibers have near-zero elasticity under working loads!",
                quiz: [
                    {
                        q: "Why are antagonistic muscle pairs necessary to move bones at joints?",
                        opts: ["Muscles can only contract (pull), they cannot actively push bones backward", "Bones produce electrical currents", "Cartilage prevents single muscles from firing", "Ligaments dissolve under single muscle strain"],
                        ans: 0,
                        expl: "Muscle fibers produce mechanical force solely by contraction; extension requires an opposing antagonistic muscle."
                    },
                    {
                        q: "Which lever class is represented by the human elbow flexing a load in the hand?",
                        opts: ["Class 3 lever (Effort between fulcrum and load)", "Class 1 lever", "Class 2 lever", "Class 4 lever"],
                        ans: 0,
                        expl: "The elbow is the fulcrum, the biceps inserts just ahead of it (effort), and the hand carries the load."
                    }
                ]
            },
            M14: {
                title: "M14: Joint Movement Lab",
                sub: "Skeletal Articulations • Ball-and-Socket, Hinge, Pivot & Gliding Joints",
                sec1: "1. JOINT ARTICULATION (°)",
                lbl1: "Articulation Arc", sym1: "\\alpha", min1: 0, max1: 90, step1: 5, def1: 45, unit1: "°",
                tool1: "Ball & Socket", tool2: "Hinge Knee", tool3: "Neck Pivot", tool4: "Synovial Fluid",
                p1: "🔄 Shoulder (360° Rot)", p1Sub: "Ball & socket",
                p2: "🚪 Knee / Elbow (Hinge)", p2Sub: "Uniaxial motion",
                p3: "🔄 Neck Atlas-Axis", p3Sub: "Rotational pivot",
                p4: "🖐️ Wrist Carpal Gliding", p4Sub: "Planar sliding",
                btnAction: "Rotate Joint Through Arc",
                leg1: "Bone Shaft", leg2: "Articular Cartilage", leg3: "Synovial Capsule",
                cardA: "Degrees of Freedom", unitA: "DoF", cardB: "Friction Coeff (μ)", unitB: "",
                status: "Articular cartilage and synovial fluid provide a virtually frictionless bearing for bones to move without wearing down.",
                objective: "Compare the degrees of freedom and mechanical constraints of ball-and-socket, hinge, pivot, and gliding synovial joints.",
                hypoQ: "Which joint type permits multiaxial movement in all planes, including full 360-degree circumduction?",
                hypoOpts: [
                    "Ball and socket joint (shoulder and hip)",
                    "Hinge joint (elbow and knee)",
                    "Pivot joint (atlas and axis)",
                    "Fixed suture joint (skull cranium)"
                ],
                hypoAns: 0,
                k1: "Joint Type:", k2: "DoF:", k3: "Cartilage Pad:", k4: "Mobility:",
                svgTitle: "Synovial Joint Cross-Section", svgTag: "Articulations",
                svgLabels: ["Articular Cartilage", "Synovial Fluid Cavity", "Fibrous Capsule"],
                principle: "Synovial joints are lubricated by synovial fluid, preventing bone-on-bone abrasion and enabling smooth skeletal locomotion.",
                formula: "$$F_{friction} = \\mu_{synovial} \\cdot F_N \\quad (\\mu \\approx 0.003)$$",
                tip: "💡 Synovial joints have a friction coefficient lower than ice sliding on ice, thanks to hyaluronic acid and lubricin!",
                quiz: [
                    {
                        q: "Which lubricating substance prevents wear and friction between articular surfaces of synovial joints?",
                        opts: ["Synovial fluid", "Lymph", "Blood plasma", "Keratin matrix"],
                        ans: 0,
                        expl: "Synovial fluid secreted by the synovial membrane cushions impact and provides boundary lubrication."
                    },
                    {
                        q: "The knee joint is an example of which mechanical joint classification?",
                        opts: ["Hinge joint", "Ball and socket joint", "Gliding joint", "Suture joint"],
                        ans: 0,
                        expl: "The knee permits flexion and extension in a single plane, operating as a modified hinge joint."
                    }
                ]
            },
            M15: {
                title: "M15: Skeleton and Breathing",
                sub: "Respiratory Biomechanics • Thoracic Cage & Diaphragm Motion",
                sec1: "1. INHALATION EXPANSION (%)",
                lbl1: "Lung Volume %", sym1: "V_L", min1: 0, max1: 100, step1: 5, def1: 60, unit1: "%",
                tool1: "Inhale Breath", tool2: "Exhale Breath", tool3: "Diaphragm Pulse", tool4: "Pressure Gauge",
                p1: "💨 Normal Exhale (Tidal)", p1Sub: "Diaphragm dome relaxed",
                p2: "🫁 Normal Inhale (500 ml)", p2Sub: "Ribs rise, chest expands",
                p3: "🏃 Deep Inhalation (Vital)", p3Sub: "Maximum thoracic volume",
                p4: "⏱ Rhythmic Breathing", p4Sub: "Continuous respiratory cycle",
                btnAction: "Toggle Inhalation / Exhalation Cycle",
                leg1: "Rib Cage & Intercostals", leg2: "Lungs & Bronchial Tree", leg3: "Diaphragm Muscle",
                cardA: "Thoracic Pressure", unitA: "mmHg", cardB: "Tidal Volume", unitB: "mL",
                status: "Contraction of the diaphragm flattens its dome and external intercostals lift ribs, expanding chest volume and drawing air into lungs.",
                objective: "Relate the contraction of intercostal muscles and flattening of the muscular diaphragm to Boyle's law in pulmonary ventilation.",
                hypoQ: "What physical mechanism causes atmospheric air to rush into the human lungs during inhalation?",
                hypoOpts: [
                    "Thoracic expansion drops intrapulmonary pressure below atmospheric pressure",
                    "Lungs actively push air inward like pumps",
                    "Heart contractions suck air through the trachea",
                    "Oxygen gas dissolves the diaphragm"
                ],
                hypoAns: 0,
                k1: "Phase:", k2: "Diaphragm State:", k3: "Thoracic Vol:", k4: "Air Flow:",
                svgTitle: "Thoracic Cage Kinematics", svgTag: "Pulmonary System",
                svgLabels: ["Rib Elevation", "Intercostal Muscle", "Diaphragm Flattening"],
                principle: "Inhalation: Intercostals and diaphragm contract -> Thoracic volume increases -> Pressure drops -> Air rushes in.",
                formula: "$$P_1 V_1 = P_2 V_2 \\implies \\Delta P \\propto -\\Delta V$$",
                tip: "💡 Lungs contain no contractile muscle tissue; they inflate and deflate purely passively due to thoracic cavity pressure changes!",
                quiz: [
                    {
                        q: "When the muscular diaphragm contracts during inhalation, what shape does it assume?",
                        opts: ["Flattens downward", "Arches upward into a dome", "Expands sideways into ribs", "Twists clockwise"],
                        ans: 0,
                        expl: "Contraction pulls the dome-shaped diaphragm flat, increasing the vertical volume of the thoracic cavity."
                    },
                    {
                        q: "Which muscles lift the ribs upward and outward during quiet inhalation?",
                        opts: ["External intercostal muscles", "Internal intercostal muscles", "Abdominal rectus", "Pectoralis minor"],
                        ans: 0,
                        expl: "External intercostals contract to elevate the rib cage like a bucket handle, increasing chest volume."
                    }
                ]
            },
            M16: {
                title: "M16: Body Weight and Movement Mechanics",
                sub: "Structural Mechanics • Center of Mass, Skeletal Loading & Stress",
                sec1: "1. BODY WEIGHT LOAD (KG)",
                lbl1: "External Weight", sym1: "M_b", min1: 20, max1: 120, step1: 5, def1: 60, unit1: "kg",
                tool1: "Ground Force Plate", tool2: "Femur Stress Map", tool3: "Center of Gravity", tool4: "Jump Impulse",
                p1: "🚶 Balanced Stance (60 kg)", p1Sub: "50-50 bilateral load",
                p2: "🏃 Single Leg Stance", p2Sub: "Full load on one femur",
                p3: "📦 Carrying 20 kg Backpack", p3Sub: "Spinal center shifted",
                p4: "🏋️ Heavy Squat Load (100 kg)", p4Sub: "Peak joint compression",
                btnAction: "Simulate Kinetic Impact & Ground Force",
                leg1: "Femur Cortical Bone", leg2: "Center of Mass (CoM)", leg3: "Ground Reaction Vector",
                cardA: "Femur Stress", unitA: "MPa", cardB: "Ground Force", unitB: "N",
                status: "The femur carries several times body weight during locomotion; trabecular spongy bone absorbs impact while compact bone resists bending.",
                objective: "Analyze ground reaction forces, skeletal compression, and center-of-mass balance during human bipedal movement.",
                hypoQ: "Why does the human femur bone have a hollow marrow cavity instead of being solid bone throughout?",
                hypoOpts: [
                    "A hollow cylinder offers maximum resistance to bending while minimizing skeletal weight",
                    "To allow muscles to grow inside the bone",
                    "To store oxygen for deep diving",
                    "Solid bones would snap under body heat"
                ],
                hypoAns: 0,
                k1: "Load (kg):", k2: "Ground Reaction:", k3: "Femur Bending:", k4: "CoM Shift:",
                svgTitle: "Femur Compressive Axis", svgTag: "Biomechanics",
                svgLabels: ["Cortical Bone", "Trabecular Lattice", "Marrow Canal"],
                principle: "Compact bone with concentric Haversian systems forms the dense outer shell, while spongy bone diffuses compressive shock.",
                formula: "$$\\sigma = \\frac{F}{A} + \\frac{M \\cdot y}{I}$$",
                tip: "💡 During running and jumping, ground reaction forces on the human knee joint reach 3 to 5 times total body weight!",
                quiz: [
                    {
                        q: "Which part of a long bone contains Haversian systems (osteons) with concentric lamellae?",
                        opts: ["Compact bone (Cortex)", "Spongy bone", "Articular cartilage", "Red bone marrow"],
                        ans: 0,
                        expl: "Compact bone consists of cylindrical structural units called osteons with central neurovascular canals."
                    },
                    {
                        q: "What minerals make up the primary rigid matrix of mammalian bone?",
                        opts: ["Calcium and phosphorus salts", "Sodium and potassium chloride", "Iron and zinc oxides", "Pure silica"],
                        ans: 0,
                        expl: "Hydroxyapatite crystals of calcium and phosphate provide bone with its compressive rigidity."
                    }
                ]
            },
            M17: {
                title: "M17: Carrot Tissue Culture & Totipotency",
                sub: "Plant Micropropagation • Explant, Callus Induction, Totipotency & Plantlet",
                sec1: "1. CULTURE INCUBATION (WEEKS)",
                lbl1: "Culture Age", sym1: "t_w", min1: 1, max1: 4, step1: 1, def1: 2, unit1: "Weeks",
                tool1: "Root Explant", tool2: "Auxin / Cytokinin", tool3: "Callus Shaker", tool4: "Sterile Hood",
                p1: "🥕 Week 1: Root Phloem Explant", p1Sub: "Sterile inoculation",
                p2: "🦠 Week 2: Callus Proliferation", p2Sub: "Unorganized dividing cells",
                p3: "🌱 Week 3: Embryoid Induction", p3Sub: "Shoots and roots form",
                p4: "🌿 Week 4: Complete Plantlet", p4Sub: "Acclimatized to soil",
                btnAction: "Adjust Hormone Balance & Induce Organogenesis",
                leg1: "Carrot Phloem Explant", leg2: "Unorganized Callus Mass", leg3: "Regenerated Plantlet",
                cardA: "Callus Diameter", unitA: "mm", cardB: "Root/Shoot Ratio", unitB: "",
                status: "Living plant parenchyma cells possess cellular totipotency—the genetic capacity to regenerate into an entire fertile organism.",
                objective: "Follow the in vitro culture of carrot root cells through callus induction, hormonal organogenesis, and plantlet regeneration.",
                hypoQ: "What is the biological term for the cellular property where a single differentiated somatic plant cell can regenerate a whole plant?",
                hypoOpts: [
                    "Cellular Totipotency",
                    "Differentiation",
                    "Parthenogenesis",
                    "Plasmolysis"
                ],
                hypoAns: 0,
                k1: "Stage:", k2: "Callus State:", k3: "Auxin/Cytokinin:", k4: "Differentiation:",
                svgTitle: "Tissue Culture Cycle", svgTag: "Plant Biotechnology",
                svgLabels: ["Root Explant", "Callus Mass", "Organogenesis"],
                principle: "Explanted parenchyma cells dedifferentiate in nutrient media with auxins/cytokinins to form a callus, which then redifferentiates.",
                formula: "$$\\text{Callus} \\longrightarrow \\text{Shoot + Root}$$",
                tip: "💡 High auxin:cytokinin ratio induces root development; high cytokinin:auxin ratio triggers shoot bud regeneration!",
                quiz: [
                    {
                        q: "An unorganized, rapidly proliferating mass of undifferentiated dividing cells in tissue culture is called a:",
                        opts: ["Callus", "Explant", "Embryoid", "Meristemoid"],
                        ans: 0,
                        expl: "A callus is an unorganized mass of proliferating parenchyma cells produced in response to culture hormones."
                    },
                    {
                        q: "Which plant growth regulator is typically supplied at high concentration to induce root formation in plant tissue culture?",
                        opts: ["Auxin", "Cytokinin", "Ethylene", "Abscisic acid"],
                        ans: 0,
                        expl: "Auxins promote root initiation, whereas cytokinins stimulate shoot differentiation."
                    }
                ]
            },
            M18: {
                title: "M18: Crown Gall Experiment",
                sub: "Pathological Proliferation • Agrobacterium tumefaciens T-DNA Transfer & Tumor",
                sec1: "1. POST-INFECTION TIME (DAYS)",
                lbl1: "Infection Day", sym1: "t_d", min1: 1, max1: 21, step1: 1, def1: 14, unit1: "Days",
                tool1: "Bacterial Inoculate", tool2: "Wounding Pin", tool3: "Heat Disinfect", tool4: "Tumor Biopsy",
                p1: "🌱 Day 1: Stem Inoculation", p1Sub: "Agrobacterium injected",
                p2: "🦠 Day 7: T-DNA Integration", p2Sub: "Overproduction of auxin",
                p3: "🌰 Day 14: Gall Tumor Emergence", p3Sub: "Unchecked hyperplasia",
                p4: "🪵 Day 21: Massive Woody Gall", p4Sub: "Disrupted vascular transport",
                btnAction: "Inoculate Agrobacterium into Wounded Stem",
                leg1: "Healthy Stem Axis", leg2: "Bacterial Infection Site", leg3: "Crown Gall Tumor Mass",
                cardA: "Tumor Volume", unitA: "mm³", cardB: "Bacterial Titer", unitB: "CFU/mg",
                status: "Agrobacterium transfers its Ti-plasmid T-DNA into the plant genome, forcing host cells to synthesize excessive auxins and opines.",
                objective: "Investigate how bacterial genetic transformation alters hormonal regulation, causing uncontrolled cell division and tumor gall formation.",
                hypoQ: "How does Agrobacterium tumefaciens trigger uncontrolled host plant cell division at the wound site?",
                hypoOpts: [
                    "By transferring T-DNA carrying auxin and cytokinin synthesis genes directly into the plant nuclear genome",
                    "By releasing a toxic enzyme that digests plant cell walls",
                    "By stealing all chloroplasts from leaves",
                    "By blocking water absorption in root hairs"
                ],
                hypoAns: 0,
                k1: "Day:", k2: "Tumor Size:", k3: "Hormone Level:", k4: "Vascular Integrity:",
                svgTitle: "Pathological Tumor Cross-Section", svgTag: "Plant Oncology",
                svgLabels: ["Normal Xylem/Phloem", "Crown Gall Tumor", "Inoculation Site"],
                principle: "The tumor inducing (Ti) plasmid transfers T-DNA into plant chromosomes, demonstrating natural genetic engineering in nature.",
                formula: "$$\\text{Tumor Volume } V(t) = V_0 \\cdot e^{\\mu \\cdot t}$$",
                tip: "💡 Because of its unique gene transfer capability, disarmed Agrobacterium is used globally as a vector to create transgenic crops!",
                quiz: [
                    {
                        q: "Which specific DNA fragment of the Ti-plasmid is transferred and integrated into the plant chromosome?",
                        opts: ["T-DNA (Transfer DNA)", "Origin of replication", "Opine catabolism region", "VirB coat protein"],
                        ans: 0,
                        expl: "The T-DNA segment flanked by 25-bp repeat borders is excised and escorted into the plant nucleus."
                    },
                    {
                        q: "Why do cells of a crown gall continue proliferating indefinitely even after all bacteria are killed with antibiotics?",
                        opts: ["T-DNA is permanently integrated into the host plant's genomic DNA", "Plant cells develop an allergy to antibiotics", "Root cap cells take over the tumor", "Dead bacteria emit radiation"],
                        ans: 0,
                        expl: "The transferred T-DNA genes are stably inherited by all descendant daughter cells during mitotic cell division."
                    }
                ]
            }
        };

        // Polyfill for CanvasRenderingContext2D.prototype.roundRect if missing in older browsers
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
                if (typeof r === 'undefined') r = 5;
                if (typeof r === 'number') r = {tl: r, tr: r, br: r, bl: r};
                this.beginPath();
                this.moveTo(x + (r.tl || 0), y);
                this.lineTo(x + w - (r.tr || 0), y);
                this.quadraticCurveTo(x + w, y, x + w, y + (r.tr || 0));
                this.lineTo(x + w, y + h - (r.br || 0));
                this.quadraticCurveTo(x + w, y + h, x + w - (r.br || 0), y + h);
                this.lineTo(x + (r.bl || 0), y + h);
                this.quadraticCurveTo(x, y + h, x, y + h - (r.bl || 0));
                this.lineTo(x, y + (r.tl || 0));
                this.quadraticCurveTo(x, y, x + (r.tl || 0), y);
                this.closePath();
                return this;
            };
        }

        class VirtualLabSimulator {
            constructor() {
                this.currentModule = 'M01';
                this.currentPrimary = 7;
                this.zoomLevel = 1.0;
                this.panX = 0;
                this.panY = 0;
                this.isPanning = false;
                this.startX = 0;
                this.startY = 0;
                this.audioEnabled = true;
                this.activeRightTab = 'flow';
                this.autoPlayInterval = null;
                this.tool1State = false; // e.g. digital ruler
                this.tool2State = true;  // e.g. cut applied
                this.tool3State = false; // e.g. safranin stain
                this.tool4State = false; // e.g. auto run
                this.particles = [];
                this.animTime = 0;
                
                this.initDomReferences();
                this.initCanvas();
                this.bindEvents();
                this.switchModule('M01');
                this.loop();
            }

            initDomReferences() {
                this.canvas = document.getElementById('sim-canvas');
                this.ctx = this.canvas.getContext('2d');
                
                this.simSelector = document.getElementById('sim-selector');
                this.headerSub = document.getElementById('header-sub');
                this.canvasHudTitle = document.getElementById('canvas-hud-title');
                this.leftSec1Title = document.getElementById('left-sec1-title');
                
                this.lblPrimary = document.getElementById('lbl-primary');
                this.txtPrimary = document.getElementById('txt-primary');
                this.symPrimary = document.getElementById('sym-primary');
                this.valPrimary = document.getElementById('val-primary');
                this.slPrimary = document.getElementById('sl-primary');
                
                this.slZoom = document.getElementById('sl-zoom');
                this.valSecondary = document.getElementById('val-secondary');
                this.canvasZoomBadge = document.getElementById('canvas-zoom-badge');
                
                this.lblTool1 = document.getElementById('lbl-tool-1');
                this.statusTool1 = document.getElementById('status-tool-1');
                this.lblTool2 = document.getElementById('lbl-tool-2');
                this.statusTool2 = document.getElementById('status-tool-2');
                this.lblTool3 = document.getElementById('lbl-tool-3');
                this.statusTool3 = document.getElementById('status-tool-3');
                this.lblTool4 = document.getElementById('lbl-tool-4');
                this.statusTool4 = document.getElementById('status-tool-4');
                
                this.presetTitle1 = document.getElementById('preset-title-1');
                this.presetSub1 = document.getElementById('preset-sub-1');
                this.presetTitle2 = document.getElementById('preset-title-2');
                this.presetSub2 = document.getElementById('preset-sub-2');
                this.presetTitle3 = document.getElementById('preset-title-3');
                this.presetSub3 = document.getElementById('preset-sub-3');
                this.presetTitle4 = document.getElementById('preset-title-4');
                this.presetSub4 = document.getElementById('preset-sub-4');
                
                this.liveStatusDesc = document.getElementById('live-status-desc');
                this.statusTimeBadge = document.getElementById('status-time-badge');
                this.btnActionText = document.getElementById('btn-action-text');
                
                this.cardLabelA = document.getElementById('card-label-a');
                this.cardLabelB = document.getElementById('card-label-b');
                this.telValA = document.getElementById('tel-val-a');
                this.telValB = document.getElementById('tel-val-b');
                this.telUnitA = document.getElementById('tel-unit-a');
                this.telUnitB = document.getElementById('tel-unit-b');
                this.telSubA = document.getElementById('tel-sub-a');
                this.telSubB = document.getElementById('tel-sub-b');
                
                this.telK1Name = document.getElementById('tel-k1-name');
                this.telK1Val = document.getElementById('tel-k1-val');
                this.telK2Name = document.getElementById('tel-k2-name');
                this.telK2Val = document.getElementById('tel-k2-val');
                this.telK3Name = document.getElementById('tel-k3-name');
                this.telK3Val = document.getElementById('tel-k3-val');
                this.telK4Name = document.getElementById('tel-k4-name');
                this.telK4Val = document.getElementById('tel-k4-val');
                
                this.theoryPrinciple = document.getElementById('theory-principle');
                this.theoryFormula = document.getElementById('theory-formula');
                this.theoryTip = document.getElementById('theory-tip');
                
                this.leg1 = document.getElementById('leg-1');
                this.leg2 = document.getElementById('leg-2');
                this.leg3 = document.getElementById('leg-3');
                
                this.fbdSvg = document.getElementById('fbd-svg');
                this.outcomeBanner = document.getElementById('outcome-banner');
                this.outcomeTitle = document.getElementById('outcome-title');
                this.outcomeDesc = document.getElementById('outcome-desc');
                this.audioIcon = document.getElementById('audio-icon');
                this.audioLabel = document.getElementById('audio-label');
            }

            initCanvas() {
                this.resizeCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
                window.addEventListener('load', () => this.resizeCanvas());
                setTimeout(() => this.resizeCanvas(), 50);
                setTimeout(() => this.resizeCanvas(), 300);
                this.bindCanvasPan();
            }

            resizeCanvas() {
                if (!this.canvas || !this.canvas.parentElement) return;
                const rect = this.canvas.parentElement.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                const width = Math.floor(rect.width || this.canvas.parentElement.clientWidth || 600);
                const height = Math.floor(rect.height || this.canvas.parentElement.clientHeight || 450);
                if (width <= 0 || height <= 0) return;
                
                this.canvas.width = width * dpr;
                this.canvas.height = height * dpr;
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
            }

            bindCanvasPan() {
                this.canvas.addEventListener('mousedown', (e) => {
                    this.isPanning = true;
                    this.startX = e.clientX - this.panX;
                    this.startY = e.clientY - this.panY;
                });
                window.addEventListener('mousemove', (e) => {
                    if (this.isPanning) {
                        this.panX = e.clientX - this.startX;
                        this.panY = e.clientY - this.startY;
                    }
                });
                window.addEventListener('mouseup', () => { this.isPanning = false; });
                this.canvas.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    if (e.deltaY < 0) this.zoomIn();
                    else this.zoomOut();
                }, { passive: false });
            }

            // Real Canvas Zoom Transform
            setZoomSlider(val) {
                const z = parseInt(val);
                this.zoomLevel = z / 100;
                if (this.slZoom) this.slZoom.value = z;
                if (this.valSecondary) this.valSecondary.innerText = \`\${z}x\`;
                if (this.canvasZoomBadge) this.canvasZoomBadge.innerText = \`\${z}x\`;
            }

            zoomIn() {
                const current = Math.round(this.zoomLevel * 100);
                this.setZoomSlider(Math.min(250, current + 15));
            }

            zoomOut() {
                const current = Math.round(this.zoomLevel * 100);
                this.setZoomSlider(Math.max(50, current - 15));
            }

            resetZoom() {
                this.setZoomSlider(100);
                this.panX = 0;
                this.panY = 0;
            }

            // Switch Tab in Right Panel (Learning Flow, Fact Cards, Check Quiz)
            setRightTab(tabKey) {
                this.activeRightTab = tabKey;
                const flowPanel = document.getElementById('panel-flow');
                const cardsPanel = document.getElementById('panel-cards');
                const quizPanel = document.getElementById('panel-quiz');
                
                const btnFlow = document.getElementById('tab-btn-flow');
                const btnCards = document.getElementById('tab-btn-cards');
                const btnQuiz = document.getElementById('tab-btn-quiz');
                
                [flowPanel, cardsPanel, quizPanel].forEach(p => p.classList.add('hidden'));
                [btnFlow, btnCards, btnQuiz].forEach(b => {
                    b.classList.remove('text-emerald-600', 'border-emerald-600');
                    b.classList.add('text-slate-500', 'border-transparent');
                });
                
                if (tabKey === 'flow') {
                    flowPanel.classList.remove('hidden');
                    btnFlow.classList.add('text-emerald-600', 'border-emerald-600');
                    btnFlow.classList.remove('text-slate-500', 'border-transparent');
                } else if (tabKey === 'cards') {
                    cardsPanel.classList.remove('hidden');
                    btnCards.classList.add('text-emerald-600', 'border-emerald-600');
                    btnCards.classList.remove('text-slate-500', 'border-transparent');
                    if (window.renderMathInElement) renderMathInElement(cardsPanel);
                } else if (tabKey === 'quiz') {
                    quizPanel.classList.remove('hidden');
                    btnQuiz.classList.add('text-emerald-600', 'border-emerald-600');
                    btnQuiz.classList.remove('text-slate-500', 'border-transparent');
                }
            }

            // Switch to Any of the 18 Modules
            switchModule(modId) {
                this.currentModule = modId;
                if (this.autoPlayInterval) { clearInterval(this.autoPlayInterval); this.autoPlayInterval = null; }
                
                const d = MODULE_DATA[modId] || MODULE_DATA.M01;
                if (this.simSelector) this.simSelector.value = modId;
                
                // Update Headers
                if (this.headerSub) this.headerSub.innerText = d.sub;
                if (this.canvasHudTitle) this.canvasHudTitle.innerText = d.title;
                if (this.leftSec1Title) this.leftSec1Title.innerText = d.sec1;
                
                // Primary Slider Config
                if (this.slPrimary) {
                    this.slPrimary.min = d.min1;
                    this.slPrimary.max = d.max1;
                    this.slPrimary.step = d.step1;
                    this.slPrimary.value = d.def1;
                    this.txtPrimary.innerText = d.lbl1;
                    this.symPrimary.innerText = d.sym1;
                    this.currentPrimary = d.def1;
                    this.valPrimary.innerText = \`\${d.def1} \${d.unit1}\`;
                }

                // Reset Zoom
                this.setZoomSlider(100);
                this.panX = 0;
                this.panY = 0;

                // Tool Labels
                if (this.lblTool1) this.lblTool1.innerText = d.tool1;
                if (this.lblTool2) this.lblTool2.innerText = d.tool2;
                if (this.lblTool3) this.lblTool3.innerText = d.tool3;
                if (this.lblTool4) this.lblTool4.innerText = d.tool4;
                
                this.tool1State = false;
                this.tool2State = (modId === 'M01'); // cut is already applied for comparison on onion
                this.tool3State = false;
                this.tool4State = false;
                this.updateToolStatuses();

                // Presets
                if (this.presetTitle1) this.presetTitle1.innerText = d.p1;
                if (this.presetSub1) this.presetSub1.innerText = d.p1Sub;
                if (this.presetTitle2) this.presetTitle2.innerText = d.p2;
                if (this.presetSub2) this.presetSub2.innerText = d.p2Sub;
                if (this.presetTitle3) this.presetTitle3.innerText = d.p3;
                if (this.presetSub3) this.presetSub3.innerText = d.p3Sub;
                if (this.presetTitle4) this.presetTitle4.innerText = d.p4;
                if (this.presetSub4) this.presetSub4.innerText = d.p4Sub;

                // Button Action text
                if (this.btnActionText) this.btnActionText.innerText = d.btnAction;

                // Status & Legends
                if (this.liveStatusDesc) this.liveStatusDesc.innerText = d.status;
                if (this.statusTimeBadge) this.statusTimeBadge.innerText = \`\${d.def1} \${d.unit1}\`;
                if (this.leg1) this.leg1.innerText = d.leg1;
                if (this.leg2) this.leg2.innerText = d.leg2;
                if (this.leg3) this.leg3.innerText = d.leg3;

                // Comparison Cards
                if (this.cardLabelA) this.cardLabelA.innerText = d.cardA;
                if (this.cardLabelB) this.cardLabelB.innerText = d.cardB;
                if (this.telUnitA) this.telUnitA.innerText = d.unitA;
                if (this.telUnitB) this.telUnitB.innerText = d.unitB;

                // Telemetry Labels
                if (this.telK1Name) this.telK1Name.innerText = d.k1;
                if (this.telK2Name) this.telK2Name.innerText = d.k2;
                if (this.telK3Name) this.telK3Name.innerText = d.k3;
                if (this.telK4Name) this.telK4Name.innerText = d.k4;

                // NCERT Scientific Principle & Formula
                if (this.theoryPrinciple) this.theoryPrinciple.innerHTML = d.principle;
                if (this.theoryFormula) this.theoryFormula.innerHTML = d.formula;
                if (this.theoryTip) this.theoryTip.innerHTML = d.tip;

                // Populate Learning Flow (Image 1)
                const flowStep1 = document.getElementById('flow-step1-text');
                if (flowStep1) flowStep1.innerText = d.objective;
                
                const flowStep2Q = document.getElementById('flow-step2-q');
                if (flowStep2Q) flowStep2Q.innerText = d.hypoQ;
                
                const flowStep2Opts = document.getElementById('flow-step2-options');
                if (flowStep2Opts) {
                    flowStep2Opts.innerHTML = d.hypoOpts.map((opt, idx) => \`
                        <label class="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition text-xs text-slate-700">
                            <input type="radio" name="hypo_option" value="\${idx}" class="custom-radio mt-0.5 shrink-0" \${idx === 0 ? 'checked' : ''}>
                            <span>\${opt}</span>
                        </label>
                    \`).join('');
                }

                const hypoFeedback = document.getElementById('flow-hypo-feedback');
                if (hypoFeedback) hypoFeedback.classList.add('hidden');
                
                const explainFeedback = document.getElementById('flow-explain-feedback');
                if (explainFeedback) explainFeedback.classList.add('hidden');
                
                const explainInput = document.getElementById('flow-explain-input');
                if (explainInput) explainInput.value = '';

                // Populate Quiz
                this.renderQuiz(d.quiz);

                // Render dynamic SVG Anatomical Diagram
                this.renderSvgDiagram(modId);

                // Update Telemetry Numbers
                this.updateTelemetry();

                // Re-render KaTeX if available
                if (window.renderMathInElement) {
                    renderMathInElement(document.getElementById('right-panel'));
                }

                this.playSound('click');
            }

            renderQuiz(quizList) {
                const container = document.getElementById('quiz-container');
                const badge = document.getElementById('quiz-status-badge');
                if (!container || !quizList) return;
                
                badge.innerText = \`\${quizList.length} Questions\`;
                container.innerHTML = quizList.map((item, qIdx) => \`
                    <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div class="text-xs font-bold text-slate-800 mb-1.5 leading-snug">Q\${qIdx + 1}: \${item.q}</div>
                        <div class="space-y-1">
                            \${item.opts.map((opt, optIdx) => \`
                                <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-100">
                                    <input type="radio" name="quiz_q_\${qIdx}" value="\${optIdx}" class="custom-radio shrink-0">
                                    <span>\${opt}</span>
                                </label>
                            \`).join('')}
                        </div>
                        <div id="quiz-expl-\${qIdx}" class="text-[10px] text-slate-600 mt-1.5 pt-1 border-t border-slate-200 hidden leading-tight"></div>
                    </div>
                \`).join('');

                const feedback = document.getElementById('quiz-feedback-box');
                if (feedback) feedback.classList.add('hidden');
            }

            submitQuiz() {
                const d = MODULE_DATA[this.currentModule];
                if (!d || !d.quiz) return;
                let correctCount = 0;
                
                d.quiz.forEach((item, qIdx) => {
                    const sel = document.querySelector(\`input[name="quiz_q_\${qIdx}"]:checked\`);
                    const explBox = document.getElementById(\`quiz-expl-\${qIdx}\`);
                    if (sel && parseInt(sel.value) === item.ans) {
                        correctCount++;
                        if (explBox) {
                            explBox.innerHTML = \`<span class="text-emerald-600 font-bold">✓ Correct!</span> \${item.expl}\`;
                            explBox.classList.remove('hidden');
                        }
                    } else {
                        if (explBox) {
                            explBox.innerHTML = \`<span class="text-rose-600 font-bold">✗ Incorrect.</span> \${item.expl}\`;
                            explBox.classList.remove('hidden');
                        }
                    }
                });

                const feedback = document.getElementById('quiz-feedback-box');
                if (feedback) {
                    feedback.classList.remove('hidden');
                    feedback.className = correctCount === d.quiz.length ? 'mt-2 text-xs font-bold text-center text-emerald-600' : 'mt-2 text-xs font-bold text-center text-amber-600';
                    feedback.innerText = \`Score: \${correctCount} of \${d.quiz.length} correct!\`;
                }

                if (correctCount === d.quiz.length && window.confetti) {
                    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
                    this.playSound('success');
                } else {
                    this.playSound('click');
                }
            }

            saveHypothesis() {
                const feedback = document.getElementById('flow-hypo-feedback');
                if (feedback) {
                    feedback.classList.remove('hidden');
                    feedback.innerText = "✓ Hypothesis successfully recorded in lab notebook!";
                }
                if (window.confetti) confetti({ particleCount: 25, spread: 50, origin: { y: 0.85 } });
                this.playSound('success');
            }

            skipHypothesis() {
                const feedback = document.getElementById('flow-hypo-feedback');
                if (feedback) {
                    feedback.classList.remove('hidden');
                    feedback.innerText = "Hypothesis step skipped.";
                }
                this.playSound('click');
            }

            saveExplanation() {
                const input = document.getElementById('flow-explain-input');
                const feedback = document.getElementById('flow-explain-feedback');
                const text = input ? input.value.trim() : '';
                const wordCount = text ? text.split(/\\s+/).length : 0;
                
                if (feedback) {
                    if (wordCount < 5) {
                        feedback.classList.remove('hidden');
                        feedback.className = 'text-[10px] font-bold mt-2 text-rose-600';
                        feedback.innerText = "Please write at least 8 words explaining your scientific reasoning.";
                    } else {
                        feedback.classList.remove('hidden');
                        feedback.className = 'text-[10px] font-bold mt-2 text-emerald-600';
                        feedback.innerText = "✓ Scientific explanation recorded!";
                        if (window.confetti) confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
                        this.playSound('success');
                    }
                }
            }

            onPrimaryChange(val) {
                this.currentPrimary = parseFloat(val);
                const d = MODULE_DATA[this.currentModule];
                if (this.valPrimary) this.valPrimary.innerText = \`\${val} \${d.unit1}\`;
                if (this.statusTimeBadge) this.statusTimeBadge.innerText = \`\${val} \${d.unit1}\`;
                this.updateTelemetry();
            }

            updateTelemetry() {
                const d = MODULE_DATA[this.currentModule];
                const p = this.currentPrimary;
                
                switch(this.currentModule) {
                    case 'M01': {
                        const lenA = (1.0 + (p - 1) * 0.58).toFixed(1);
                        const lenB = (this.tool2State && p >= 3 ? 2.1 : lenA);
                        if (this.telValA) this.telValA.innerText = lenA;
                        if (this.telValB) this.telValB.innerText = lenB;
                        if (this.telK1Val) this.telK1Val.innerText = \`\${p} Days\`;
                        if (this.telK2Val) this.telK2Val.innerText = this.tool2State ? "Day 3 (1.0cm)" : "None";
                        if (this.telK3Val) this.telK3Val.innerText = "+0.58 cm/d";
                        if (this.telK4Val) this.telK4Val.innerText = (this.tool2State && p >= 3) ? "Tip Excised (Halted)" : "Active Mitosis";
                        break;
                    }
                    case 'M02': {
                        if (this.telValA) this.telValA.innerText = (1200 + p * 340).toString();
                        if (this.telValB) this.telValB.innerText = (8.5 + p * 1.5).toFixed(1);
                        if (this.telK1Val) this.telK1Val.innerText = \`Zone \${p}\`;
                        if (this.telK2Val) this.telK2Val.innerText = p === 1 ? "Apical Apex" : p === 2 ? "Intercalary" : p === 3 ? "Lateral" : "Root Cap";
                        if (this.telK3Val) this.telK3Val.innerText = p === 1 ? "Elongation" : p === 2 ? "Node Growth" : p === 3 ? "Girth Exp" : "Root Elong";
                        if (this.telK4Val) this.telK4Val.innerText = "Dense Cytoplasm";
                        break;
                    }
                    case 'M03': {
                        if (this.telValA) this.telValA.innerText = p.toString();
                        if (this.telValB) this.telValB.innerText = (4.5 + p * 1.8).toFixed(1);
                        if (this.telK1Val) this.telK1Val.innerText = \`\${p} Yrs\`;
                        if (this.telK2Val) this.telK2Val.innerText = \`\${p} Rings\`;
                        if (this.telK3Val) this.telK3Val.innerText = \`\${Math.round(p * 3.8)}%\`;
                        if (this.telK4Val) this.telK4Val.innerText = "Temperate Clime";
                        break;
                    }
                    default: {
                        if (this.telValA) this.telValA.innerText = (p * 1.2).toFixed(1);
                        if (this.telValB) this.telValB.innerText = (p * 0.85).toFixed(1);
                        if (this.telK1Val) this.telK1Val.innerText = \`\${p} \${d.unit1}\`;
                        if (this.telK2Val) this.telK2Val.innerText = "Nominal";
                        if (this.telK3Val) this.telK3Val.innerText = "Steady";
                        if (this.telK4Val) this.telK4Val.innerText = "Active";
                        break;
                    }
                }
            }

            renderSvgDiagram(modId) {
                if (!this.fbdSvg) return;
                let svgHtml = '';
                switch(modId) {
                    case 'M01':
                        svgHtml = \`
                            <defs>
                                <linearGradient id="rootGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#fde047" />
                                    <stop offset="70%" stop-color="#ca8a04" />
                                    <stop offset="100%" stop-color="#854d0e" />
                                </linearGradient>
                            </defs>
                            <path d="M 50 10 Q 50 70 80 85 Q 110 70 110 10 Z" fill="url(#rootGrad)" stroke="#a16207" stroke-width="2" />
                            <circle cx="80" cy="80" r="8" fill="#ef4444" opacity="0.8" />
                            <text x="130" y="25" font-size="10" font-weight="bold" fill="#713f12">Maturation Zone</text>
                            <text x="130" y="52" font-size="10" font-weight="bold" fill="#2563eb">Elongation Zone</text>
                            <text x="130" y="80" font-size="10" font-weight="bold" fill="#dc2626">Apical Meristem (Tip)</text>
                            <line x1="100" y1="80" x2="125" y2="80" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="2,2"/>
                        \`;
                        break;
                    case 'M02':
                        svgHtml = \`
                            <rect x="70" y="10" width="30" height="70" rx="6" fill="#86efac" stroke="#16a34a" stroke-width="2" />
                            <circle cx="85" cy="15" r="9" fill="#22c55e" />
                            <line x1="70" y1="45" x2="100" y2="45" stroke="#3b82f6" stroke-width="3" />
                            <rect x="70" y="28" width="6" height="35" fill="#f59e0b" />
                            <text x="120" y="20" font-size="9.5" font-weight="bold" fill="#15803d">1. Shoot Apical</text>
                            <text x="120" y="47" font-size="9.5" font-weight="bold" fill="#2563eb">2. Intercalary (Nodes)</text>
                            <text x="120" y="72" font-size="9.5" font-weight="bold" fill="#b45309">3. Lateral Cambium</text>
                        \`;
                        break;
                    case 'M03':
                        svgHtml = \`
                            <circle cx="75" cy="45" r="38" fill="#fef3c7" stroke="#92400e" stroke-width="3" />
                            <circle cx="75" cy="45" r="28" fill="none" stroke="#b45309" stroke-width="2" stroke-dasharray="4,2"/>
                            <circle cx="75" cy="45" r="18" fill="none" stroke="#d97706" stroke-width="2"/>
                            <circle cx="75" cy="45" r="8" fill="#78350f" />
                            <text x="125" y="28" font-size="9.5" font-weight="bold" fill="#78350f">Bark & Cambium</text>
                            <text x="125" y="50" font-size="9.5" font-weight="bold" fill="#b45309">Springwood (Wide)</text>
                            <text x="125" y="72" font-size="9.5" font-weight="bold" fill="#451a03">Autumnwood (Dense)</text>
                        \`;
                        break;
                    default:
                        svgHtml = \`
                            <rect x="40" y="15" width="80" height="60" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
                            <circle cx="80" cy="45" r="16" fill="#0284c7" opacity="0.3" />
                            <text x="135" y="35" font-size="10" font-weight="bold" fill="#0369a1">\${modId} Tissue Map</text>
                            <text x="135" y="55" font-size="9" fill="#64748b">Histological Section</text>
                        \`;
                        break;
                }
                this.fbdSvg.innerHTML = svgHtml;
            }

            toggleTool1() {
                this.tool1State = !this.tool1State;
                this.updateToolStatuses();
                this.showBanner(
                    this.tool1State ? "Digital Ruler Activated" : "Digital Ruler Disabled",
                    this.tool1State ? "Measuring caliper overlay enabled on canvas." : "Measurement scale hidden."
                );
                this.playSound('click');
            }

            triggerTool2() {
                this.tool2State = !this.tool2State;
                this.updateToolStatuses();
                
                // Spawn cut particles at tip
                const w = this.canvas.clientWidth;
                const h = this.canvas.clientHeight;
                for (let i = 0; i < 20; i++) {
                    this.particles.push({
                        x: w * 0.68 + (Math.random() - 0.5) * 40,
                        y: h * 0.65 + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 4,
                        vy: Math.random() * -3 - 1,
                        alpha: 1.0,
                        color: '#ef4444'
                    });
                }

                this.showBanner(
                    this.tool2State ? "Root Tip Excised (Jar B)" : "Root Tip Restored",
                    this.tool2State ? "Apical meristem removed! Cell division in Jar B will halt from Day 3 onwards." : "Tip regenerated."
                );
                this.updateTelemetry();
                this.playSound('cut');
            }

            toggleTool3() {
                this.tool3State = !this.tool3State;
                this.updateToolStatuses();
                this.showBanner(
                    this.tool3State ? "Safranin Dye Applied" : "Slide Unstained",
                    this.tool3State ? "Cell nuclei and chromosomes stained bright crimson." : "Standard optical view restored."
                );
                this.playSound('click');
            }

            toggleAutoRun() {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                    this.autoPlayInterval = null;
                    this.tool4State = false;
                    this.showBanner("Timeline Paused", "Playback halted at current parameter.");
                } else {
                    this.tool4State = true;
                    this.showBanner("Auto-Play Running", "Advancing through experiment timeline...");
                    const d = MODULE_DATA[this.currentModule];
                    this.autoPlayInterval = setInterval(() => {
                        let nextVal = this.currentPrimary + d.step1;
                        if (nextVal > d.max1) nextVal = d.min1;
                        this.slPrimary.value = nextVal;
                        this.onPrimaryChange(nextVal);
                    }, 800);
                }
                this.updateToolStatuses();
                this.playSound('click');
            }

            updateToolStatuses() {
                if (this.statusTool1) this.statusTool1.innerText = this.tool1State ? "ON" : "OFF";
                if (this.statusTool2) this.statusTool2.innerText = this.tool2State ? "CUT" : "INTACT";
                if (this.statusTool3) this.statusTool3.innerText = this.tool3State ? "STAIN" : "OFF";
                if (this.statusTool4) this.statusTool4.innerText = this.tool4State ? "PAUSE" : "RUN";
            }

            applyPreset(pNum) {
                const d = MODULE_DATA[this.currentModule];
                if (pNum === 1) {
                    this.tool2State = false;
                    this.onPrimaryChange(d.min1);
                    this.slPrimary.value = d.min1;
                    this.showBanner(d.p1, d.p1Sub);
                } else if (pNum === 2) {
                    this.tool2State = true;
                    const midVal = Math.round((d.min1 + d.max1) / 2);
                    this.onPrimaryChange(midVal);
                    this.slPrimary.value = midVal;
                    this.showBanner(d.p2, d.p2Sub);
                } else if (pNum === 3) {
                    this.tool2State = true;
                    this.onPrimaryChange(d.max1);
                    this.slPrimary.value = d.max1;
                    this.showBanner(d.p3, d.p3Sub);
                } else if (pNum === 4) {
                    this.setZoomSlider(200);
                    this.showBanner(d.p4, d.p4Sub);
                }
                this.updateToolStatuses();
                this.playSound('click');
            }

            onPrimaryActionClick() {
                const d = MODULE_DATA[this.currentModule];
                let nextVal = this.currentPrimary + d.step1;
                if (nextVal > d.max1) nextVal = d.min1;
                this.slPrimary.value = nextVal;
                this.onPrimaryChange(nextVal);
                
                this.showBanner(
                    \`Advanced to \${nextVal} \${d.unit1}\`,
                    \`Observation recorded at \${nextVal} \${d.unit1}. Telemetry matrix updated.\`
                );
                this.playSound('click');
            }

            showBanner(title, desc) {
                if (!this.outcomeBanner) return;
                this.outcomeTitle.innerText = title;
                this.outcomeDesc.innerText = desc;
                this.outcomeBanner.classList.remove('opacity-0', 'translate-y-24', 'pointer-events-none');
                clearTimeout(this.bannerTimer);
                this.bannerTimer = setTimeout(() => this.dismissBanner(), 4000);
            }

            dismissBanner() {
                if (!this.outcomeBanner) return;
                this.outcomeBanner.classList.add('opacity-0', 'translate-y-24', 'pointer-events-none');
            }

            toggleAudio() {
                this.audioEnabled = !this.audioEnabled;
                if (this.audioIcon) {
                    this.audioIcon.className = this.audioEnabled ? "fa-solid fa-volume-high text-blue-600" : "fa-solid fa-volume-xmark text-slate-400";
                }
                if (this.audioLabel) {
                    this.audioLabel.innerText = this.audioEnabled ? "Audio On" : "Muted";
                }
            }

            playSound(type) {
                if (!this.audioEnabled) return;
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    if (type === 'click') {
                        osc.frequency.setValueAtTime(600, ctx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
                        gain.gain.setValueAtTime(0.12, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
                        osc.start(); osc.stop(ctx.currentTime + 0.05);
                    } else if (type === 'cut') {
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(900, ctx.currentTime);
                        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.12);
                        gain.gain.setValueAtTime(0.2, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
                        osc.start(); osc.stop(ctx.currentTime + 0.12);
                    } else if (type === 'success') {
                        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
                        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
                        gain.gain.setValueAtTime(0.2, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
                        osc.start(); osc.stop(ctx.currentTime + 0.3);
                    }
                } catch(e) {}
            }

            resetCurrent() {
                this.switchModule(this.currentModule);
                this.showBanner("Simulation Reset", "Restored default experimental conditions.");
            }

            bindEvents() {
                // Key shortcut: Space to step, R to reset
                window.addEventListener('keydown', (e) => {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                    if (e.code === 'Space') {
                        e.preventDefault();
                        this.onPrimaryActionClick();
                    } else if (e.code === 'KeyR') {
                        this.resetCurrent();
                    }
                });
            }

            // --- ANIMATION LOOP ---
            loop() {
                if (!this.canvas || !this.ctx) return;
                const dpr = window.devicePixelRatio || 1;
                const w = this.canvas.clientWidth || (this.canvas.width / dpr) || 600;
                const h = this.canvas.clientHeight || (this.canvas.height / dpr) || 450;
                this.animTime += 0.025;

                // Reset transform and clear pixel buffer
                this.ctx.save();
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();

                // Apply DPR, Pan & Zoom
                this.ctx.save();
                this.ctx.scale(dpr, dpr);
                this.ctx.translate(w / 2 + this.panX, h / 2 + this.panY);
                this.ctx.scale(this.zoomLevel, this.zoomLevel);
                this.ctx.translate(-w / 2, -h / 2);

                // Draw Active Experiment
                try {
                    switch(this.currentModule) {
                        case 'M01': this.drawM01(w, h); break;
                        case 'M02': this.drawM02(w, h); break;
                        case 'M03': this.drawM03(w, h); break;
                        case 'M04': this.drawM04(w, h); break;
                        case 'M05': this.drawM05(w, h); break;
                        case 'M06': this.drawM06(w, h); break;
                        case 'M07': this.drawM07(w, h); break;
                        case 'M08': this.drawM08(w, h); break;
                        case 'M09': this.drawM09(w, h); break;
                        case 'M10': this.drawM10(w, h); break;
                        case 'M11': this.drawM11(w, h); break;
                        case 'M12': this.drawM12(w, h); break;
                        case 'M13': this.drawM13(w, h); break;
                        case 'M14': this.drawM14(w, h); break;
                        case 'M15': this.drawM15(w, h); break;
                        case 'M16': this.drawM16(w, h); break;
                        case 'M17': this.drawM17(w, h); break;
                        case 'M18': this.drawM18(w, h); break;
                        default: this.drawM01(w, h); break;
                    }
                } catch(drawErr) {
                    console.error('Simulation draw error:', drawErr);
                }

                // Render dynamic particles
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= 0.02;
                    this.ctx.fillStyle = p.color;
                    this.ctx.globalAlpha = Math.max(0, p.alpha);
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1.0;
                    if (p.alpha <= 0) this.particles.splice(i, 1);
                }

                this.ctx.restore();
                requestAnimationFrame(() => this.loop());
            }

            // --- 18 SCIENTIFIC SIMULATION RENDERERS ---

            // M01: Onion Root Growth (Jars A & B)
            drawM01(w, h) {
                const ctx = this.ctx;
                const benchY = h * 0.78;
                ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, benchY, w, h - benchY);
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, benchY); ctx.lineTo(w, benchY); ctx.stroke();

                const jarA_x = w * 0.32; const jarB_x = w * 0.68;
                const jarW = Math.min(180, w * 0.3); const jarH = Math.min(230, h * 0.55);
                const jarY = benchY - jarH;

                const lenA = 1.0 + (this.currentPrimary - 1) * 0.58;
                const lenB = this.tool2State && this.currentPrimary >= 3 ? 2.1 : lenA;

                this.drawSingleJar(jarA_x, jarY, jarW, jarH, "Jar A (Control)", lenA, false, '#2563eb');
                this.drawSingleJar(jarB_x, jarY, jarW, jarH, "Jar B (Excised)", lenB, this.tool2State && this.currentPrimary >= 3, '#f59e0b');

                if (this.tool1State) {
                    this.drawDigitalCaliper(jarA_x + jarW / 2 + 10, jarY + 80, lenA * 22, \`\${lenA.toFixed(1)} cm\`);
                    this.drawDigitalCaliper(jarB_x + jarW / 2 + 10, jarY + 80, lenB.toFixed(1) * 22, \`\${Number(lenB).toFixed(1)} cm\`);
                }
            }

            drawSingleJar(x, y, w, h, label, rootLenCm, isCut, accentColor) {
                const ctx = this.ctx;
                // Glass Jar
                ctx.fillStyle = 'rgba(239, 246, 255, 0.45)';
                ctx.fillRect(x - w / 2, y, w, h);
                ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
                ctx.strokeRect(x - w / 2, y, w, h);
                
                // Water Level
                const waterY = y + 45;
                ctx.fillStyle = 'rgba(191, 219, 254, 0.65)';
                ctx.fillRect(x - w / 2 + 3, waterY, w - 6, h - 48);

                // Water Line waves
                ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x - w / 2 + 3, waterY);
                ctx.lineTo(x + w / 2 - 3, waterY);
                ctx.stroke();

                // Onion Bulb
                const bulbY = y + 38;
                ctx.fillStyle = this.tool3State ? '#fda4af' : '#fef08a';
                ctx.strokeStyle = this.tool3State ? '#e11d48' : '#ca8a04';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.ellipse(x, bulbY, 32, 28, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Onion green shoot at top
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.moveTo(x - 5, bulbY - 26);
                ctx.lineTo(x, bulbY - 50);
                ctx.lineTo(x + 5, bulbY - 26);
                ctx.fill();

                // Roots Growing Downward
                const rootPixels = rootLenCm * 22;
                const rootCount = 7;
                for (let i = 0; i < rootCount; i++) {
                    const rx = x - 18 + i * 6;
                    const rBaseY = bulbY + 22;
                    ctx.strokeStyle = this.tool3State ? '#be123c' : '#78350f';
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();
                    ctx.moveTo(rx, rBaseY);
                    
                    const sway = Math.sin(this.animTime + i) * 3;
                    const endY = rBaseY + rootPixels;
                    ctx.quadraticCurveTo(rx + sway, rBaseY + rootPixels * 0.5, rx + sway * 0.5, endY);
                    ctx.stroke();

                    // Root Tip / Meristem Zone
                    if (!isCut || i % 2 !== 0) {
                        ctx.fillStyle = this.tool3State ? '#9f1239' : '#ef4444';
                        ctx.beginPath();
                        ctx.arc(rx + sway * 0.5, endY, 3.2, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Scissors Cut Mark
                        ctx.strokeStyle = '#ef4444';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(rx - 4, endY - 4); ctx.lineTo(rx + 4, endY + 4);
                        ctx.moveTo(rx + 4, endY - 4); ctx.lineTo(rx - 4, endY + 4);
                        ctx.stroke();
                    }
                }

                // Label Badge
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(x - 50, y + h + 10, 100, 24, 6);
                ctx.fill(); ctx.stroke();
                
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, x, y + h + 26);
            }

            drawDigitalCaliper(x, y, heightPx, text) {
                const ctx = this.ctx;
                ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y); ctx.lineTo(x, y + heightPx);
                ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
                ctx.moveTo(x - 5, y + heightPx); ctx.lineTo(x + 5, y + heightPx);
                ctx.stroke();

                ctx.fillStyle = '#2563eb';
                ctx.font = 'bold 10px JetBrains Mono, monospace';
                ctx.textAlign = 'left';
                ctx.fillText(text, x + 8, y + heightPx / 2 + 4);
            }

            // M02: Meristem Locator
            drawM02(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                
                // Stem
                ctx.fillStyle = '#86efac'; ctx.fillRect(cx - 25, cy - 140, 50, 280);
                ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 3;
                ctx.strokeRect(cx - 25, cy - 140, 50, 280);

                // Shoot Tip
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(cx, cy - 140, 30, Math.PI, 0);
                ctx.fill(); ctx.stroke();

                // Lateral Cambium Lines
                ctx.strokeStyle = '#d97706'; ctx.lineWidth = 4; ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(cx - 15, cy - 100); ctx.lineTo(cx - 15, cy + 100);
                ctx.moveTo(cx + 15, cy - 100); ctx.lineTo(cx + 15, cy + 100);
                ctx.stroke(); ctx.setLineDash([]);

                // Nodes (Intercalary)
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(cx - 30, cy - 30, 60, 8);
                ctx.fillRect(cx - 30, cy + 40, 60, 8);

                // Highlight active zone
                const p = this.currentPrimary;
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
                if (p === 1) { // Apical
                    ctx.strokeRect(cx - 40, cy - 175, 80, 50);
                    this.drawLabelTag(cx + 50, cy - 150, "1. Shoot Apical (Height)");
                } else if (p === 2) { // Intercalary
                    ctx.strokeRect(cx - 40, cy - 35, 80, 20);
                    this.drawLabelTag(cx + 50, cy - 25, "2. Intercalary Meristem");
                } else if (p === 3) { // Lateral Cambium
                    ctx.strokeRect(cx - 30, cy - 80, 60, 160);
                    this.drawLabelTag(cx + 50, cy, "3. Lateral Cambium (Girth)");
                } else if (p === 4) { // Root Apical
                    ctx.strokeRect(cx - 40, cy + 120, 80, 40);
                    this.drawLabelTag(cx + 50, cy + 140, "4. Root Apical Meristem");
                }
            }

            drawLabelTag(x, y, text) {
                const ctx = this.ctx;
                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.roundRect(x, y - 12, 160, 24, 6);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#991b1b'; ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'left'; ctx.fillText(text, x + 8, y + 4);
            }

            // M03: Tree Rings and Annual Growth
            drawM03(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                const years = this.currentPrimary;

                // Base bark
                ctx.fillStyle = '#78350f';
                ctx.beginPath(); ctx.arc(cx, cy, 140, 0, Math.PI * 2); ctx.fill();

                // Concentric rings
                for (let i = years; i >= 1; i--) {
                    const r = 20 + i * (110 / Math.max(1, years));
                    ctx.fillStyle = (i % 2 === 0) ? '#fef3c7' : '#fde68a';
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.8; ctx.stroke();
                }

                // Core pith
                ctx.fillStyle = '#451a03';
                ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();

                ctx.fillStyle = '#1e293b'; ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(\`\${years} Annual Concentric Rings (Years)\`, cx, cy + 160);
            }

            // M04: Grass and Hedge Regrowth
            drawM04(w, h) {
                const ctx = this.ctx;
                const benchY = h * 0.75;
                ctx.fillStyle = '#15803d'; ctx.fillRect(0, benchY, w, h - benchY);
                
                const hours = this.currentPrimary;
                const heightPx = 20 + (hours / 72) * 110;
                
                for (let i = 0; i < 25; i++) {
                    const gx = 40 + i * (w - 80) / 25;
                    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(gx, benchY);
                    ctx.lineTo(gx + Math.sin(this.animTime + i) * 6, benchY - heightPx);
                    ctx.stroke();
                }

                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.roundRect(w * 0.5 - 90, 40, 180, 30, 8); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#14532d'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(\`Regrown Height: \${heightPx.toFixed(0)} mm (\${hours}h)\`, w * 0.5, 60);
            }

            // M05: Plant Tissue Microscope
            drawM05(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5; const r = Math.min(130, w * 0.28);
                
                // Microscope Field of View circle
                ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 6; ctx.stroke();

                // Cellular Honeycomb Grid
                const step = 26;
                for (let x = cx - r; x <= cx + r; x += step) {
                    for (let y = cy - r; y <= cy + r; y += step) {
                        const dist = Math.hypot(x - cx, y - cy);
                        if (dist < r - 10) {
                            ctx.fillStyle = this.tool3State ? '#fecdd3' : '#dcfce7';
                            ctx.strokeStyle = '#15803d'; ctx.lineWidth = 2.5;
                            ctx.beginPath(); ctx.arc(x, y, step * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                            // Nucleus
                            ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.arc(x + 2, y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
                        }
                    }
                }
            }

            // M06: Xylem and Phloem Transport
            drawM06(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                
                // Xylem tube (Upward)
                ctx.fillStyle = '#dbeafe'; ctx.fillRect(cx - 70, cy - 120, 50, 240);
                ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3; ctx.strokeRect(cx - 70, cy - 120, 50, 240);
                
                // Phloem tube (Bidirectional)
                ctx.fillStyle = '#fef3c7'; ctx.fillRect(cx + 20, cy - 120, 50, 240);
                ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3; ctx.strokeRect(cx + 20, cy - 120, 50, 240);

                // Animated Water molecules in Xylem (Up)
                for (let i = 0; i < 6; i++) {
                    const yPos = (cy + 100 - ((this.animTime * 40 + i * 40) % 220));
                    ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.arc(cx - 45, yPos, 6, 0, Math.PI * 2); ctx.fill();
                }

                // Animated Sucrose in Phloem (Down)
                for (let i = 0; i < 6; i++) {
                    const yPos = (cy - 100 + ((this.animTime * 30 + i * 40) % 220));
                    ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(cx + 45, yPos, 6, 0, Math.PI * 2); ctx.fill();
                }

                ctx.fillStyle = '#1e3a8a'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText("XYLEM (Water ↑)", cx - 45, cy - 130);
                ctx.fillStyle = '#92400e';
                ctx.fillText("PHLOEM (Sucrose ↕)", cx + 45, cy - 130);
            }

            // M07: Plant Epidermal Tissue & Stomata
            drawM07(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                const aperture = this.currentPrimary / 100;
                
                // Guard Cells
                ctx.fillStyle = '#86efac'; ctx.strokeStyle = '#15803d'; ctx.lineWidth = 3;
                // Left guard cell
                ctx.beginPath(); ctx.ellipse(cx - 20 - aperture * 10, cy, 22, 55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                // Right guard cell
                ctx.beginPath(); ctx.ellipse(cx + 20 + aperture * 10, cy, 22, 55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                // Stomatal Pore
                ctx.fillStyle = '#0f172a';
                ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, aperture * 18), 35, 0, 0, Math.PI * 2); ctx.fill();
            }

            // M08: Epithelial Tissue
            drawM08(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Basement Membrane
                ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(cx - 150, cy + 40); ctx.lineTo(cx + 150, cy + 40); ctx.stroke();
                
                // Epithelial cells resting on membrane
                for (let i = 0; i < 6; i++) {
                    const bx = cx - 140 + i * 48;
                    ctx.fillStyle = '#fed7aa'; ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 2;
                    ctx.fillRect(bx, cy - 30, 46, 70); ctx.strokeRect(bx, cy - 30, 46, 70);
                    // Nucleus
                    ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(bx + 23, cy + 5, 8, 0, Math.PI * 2); ctx.fill();
                }
            }

            // M09: Blood Centrifuge
            drawM09(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Test Tube
                ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(cx - 30, cy - 110, 60, 220);
                ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; ctx.strokeRect(cx - 30, cy - 110, 60, 220);
                
                // Plasma layer (Top 55%)
                ctx.fillStyle = '#fef08a'; ctx.fillRect(cx - 28, cy - 108, 56, 110);
                // Buffy coat (Thin line)
                ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 28, cy + 2, 56, 6);
                // RBC layer (Bottom 45%)
                ctx.fillStyle = '#dc2626'; ctx.fillRect(cx - 28, cy + 8, 56, 100);
            }

            // M10: Connective Tissue Fibers
            drawM10(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Collagen wavy fibers
                ctx.strokeStyle = '#fda4af'; ctx.lineWidth = 5;
                for (let i = -3; i <= 3; i++) {
                    ctx.beginPath();
                    for (let x = cx - 120; x <= cx + 120; x += 10) {
                        const y = cy + i * 25 + Math.sin(x * 0.05 + this.animTime) * 8;
                        if (x === cx - 120) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
            }

            // M11: Muscle Tissue (Contraction)
            drawM11(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                const bpm = this.currentPrimary;
                const pulse = Math.sin(this.animTime * (bpm / 15)) * 12;
                
                // Muscle Belly
                ctx.fillStyle = '#dc2626'; ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 100 + pulse, 35 - pulse * 0.25, 0, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();

                // Tendons
                ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
                ctx.fillRect(cx - 150, cy - 10, 50, 20); ctx.strokeRect(cx - 150, cy - 10, 50, 20);
                ctx.fillRect(cx + 100, cy - 10, 50, 20); ctx.strokeRect(cx + 100, cy - 10, 50, 20);
            }

            // M12: Neuron Signal Action Potential
            drawM12(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Cyton body
                ctx.fillStyle = '#e0e7ff'; ctx.strokeStyle = '#4338ca'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx - 110, cy, 28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                // Axon cable
                ctx.beginPath(); ctx.moveTo(cx - 82, cy); ctx.lineTo(cx + 110, cy); ctx.stroke();
                
                // Myelin Sheaths
                for (let i = 0; i < 4; i++) {
                    const mx = cx - 60 + i * 42;
                    ctx.fillStyle = '#fde047'; ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2;
                    ctx.fillRect(mx, cy - 12, 32, 24); ctx.strokeRect(mx, cy - 12, 32, 24);
                }

                // Electrical impulse spark
                const sparkX = (cx - 70 + ((this.animTime * 140) % 180));
                ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(sparkX, cy, 7, 0, Math.PI * 2); ctx.fill();
            }

            // M13: Muscle-Tendon-Bone (Elbow)
            drawM13(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.45; const cy = h * 0.6;
                const angle = this.currentPrimary * (Math.PI / 180);
                
                // Humerus (Upper arm)
                ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 24;
                ctx.beginPath(); ctx.moveTo(cx, cy - 120); ctx.lineTo(cx, cy); ctx.stroke();
                
                // Forearm (Radius/Ulna)
                const armLen = 130;
                const fx = cx + Math.sin(angle) * armLen;
                const fy = cy - Math.cos(angle) * armLen;
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 20;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(fx, fy); ctx.stroke();
                
                // Joint pivot
                ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
            }

            // M14: Joint Movement Lab
            drawM14(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Ball and socket joint
                ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
                // Socket
                ctx.beginPath(); ctx.arc(cx - 30, cy, 40, -Math.PI / 2, Math.PI / 2); ctx.stroke();
                // Ball
                ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(cx - 30, cy, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                // Bone arm
                ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 18;
                ctx.beginPath(); ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 90, cy); ctx.stroke();
            }

            // M15: Skeleton & Breathing
            drawM15(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                const lungExpand = (this.currentPrimary / 100) * 18;
                
                // Lungs
                ctx.fillStyle = '#fca5a5'; ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.ellipse(cx - 45 - lungExpand * 0.5, cy, 35 + lungExpand, 55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.ellipse(cx + 45 + lungExpand * 0.5, cy, 35 + lungExpand, 55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                // Diaphragm
                ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(cx - 100, cy + 75 - lungExpand);
                ctx.quadraticCurveTo(cx, cy + 50 - lungExpand * 1.5, cx + 100, cy + 75 - lungExpand);
                ctx.stroke();
            }

            // M16: Body Weight Mechanics
            drawM16(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Femur bone column
                ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 4;
                ctx.fillRect(cx - 25, cy - 90, 50, 180); ctx.strokeRect(cx - 25, cy - 90, 50, 180);
                
                // Weight Force vector arrow
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(cx, cy - 130); ctx.lineTo(cx, cy - 90); ctx.stroke();
            }

            // M17: Carrot Tissue Culture
            drawM17(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Petri Dish / Flask
                ctx.fillStyle = 'rgba(240, 253, 244, 0.6)'; ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#15803d'; ctx.lineWidth = 4; ctx.stroke();
                
                // Callus tissue clump
                ctx.fillStyle = '#86efac';
                for (let i = 0; i < 8; i++) {
                    const ang = i * Math.PI / 4;
                    ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * 18, cy + Math.sin(ang) * 18, 14, 0, Math.PI * 2); ctx.fill();
                }
            }

            // M18: Crown Gall Tumor
            drawM18(w, h) {
                const ctx = this.ctx;
                const cx = w * 0.5; const cy = h * 0.5;
                // Plant stem
                ctx.fillStyle = '#86efac'; ctx.fillRect(cx - 20, cy - 110, 40, 220);
                ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 3; ctx.strokeRect(cx - 20, cy - 110, 40, 220);
                
                // Tumor gall outgrowth
                const tumorR = 15 + (this.currentPrimary / 21) * 35;
                ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#451a03'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(cx + 25, cy, tumorR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
        }

        // Initialize Simulator on Page Load
        let sim = null;
        window.addEventListener('DOMContentLoaded', () => {
            sim = new VirtualLabSimulator();
        });
    </script>
</body>
</html>`;
};

const fullHtml = generateHtml();

// Write to index.html
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), fullHtml, 'utf8');
console.log('Successfully written index.html');

// Write to docs/index.html
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'index.html'), fullHtml, 'utf8');
console.log('Successfully written docs/index.html');

// Write to docs/404.html
fs.writeFileSync(path.join(__dirname, '..', 'docs', '404.html'), fullHtml, 'utf8');
console.log('Successfully written docs/404.html');

