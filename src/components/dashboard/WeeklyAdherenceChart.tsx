import React, { useState, useEffect, useRef } from 'react';
import PatientHeader from '../../components/patient/PatientHeader';
import ToggleTabs from '../../components/patient/ToggleTabs';
import ExerciseCard from '../../components/patient/ExerciseCard';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import {
  useAdherenceStatsQuery,
  usePatientsQuery,
  useMarkCompletedMutation,
  useCreatePatientMutation,
  useDashboardPainReportsQuery,
  useDashboardChartDataQuery,
  useDashboardPatientExercisesQuery,
  useDashboardRecentWorkoutsQuery,
} from '../../hooks';
import {
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  UserPlus,
  Play,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Clock,
  HeartPulse,
  Timer,
  RefreshCw,
  Info,
  AlertTriangle,
  Sliders,
  Check,
  X,
 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import Modal from '../../components/Modal';
import Button from '../../components/ui/Button';

// --- WEEKLY ADHERENCE CHART COMPONENT WITH CANVAS & HOVER GLOWS (Heurística #4 & Heurística #10) ---

function WeeklyAdherenceChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const { data: chartData, isLoading } = useDashboardChartDataQuery();
  const data = chartData || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI (Retina displays) for crystal clear lines
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const paddingLeft = 40;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Draw reference grid lines
    const gridLines = [0, 25, 50, 75, 100];
    ctx.strokeStyle = '#e5e9e615';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#89938e';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    gridLines.forEach(val => {
      const y = paddingTop + chartHeight - (val / 100) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff10' : '#00000008';
      ctx.stroke();
      ctx.fillText(`${val}%`, paddingLeft - 8, y + 3);
    });

    const barSpacing = chartWidth / data.length;
    const barWidth = Math.min(32, barSpacing * 0.55);

    data.forEach((item, idx) => {
      const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
      const barHeight = (item.pct / 100) * chartHeight;
      const y = paddingTop + chartHeight - barHeight;

      // Hover column highlight
      if (hoveredIdx === idx) {
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#ffffff07' : '#00000004';
        ctx.beginPath();
        ctx.roundRect(paddingLeft + idx * barSpacing, paddingTop - 10, barSpacing, chartHeight + 15, 8);
        ctx.fill();
      }

      // Semantic Color Coding based on performance threshold (Heurística #4)
      let fillStyle;
      if (item.pct >= 80) {
        // High performance: Deep Emerald gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#59c3b0');
        grad.addColorStop(1, '#006b5d');
        fillStyle = grad;
      } else if (item.pct >= 65) {
        // Moderate performance: Amber gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#fbbf24');
        grad.addColorStop(1, '#b45309');
        fillStyle = grad;
      } else {
        // Low performance: Severe red gradient
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(1, '#ba1a1a');
        fillStyle = grad;
      }

      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Draw exact percentage above the bar on hover
      if (hoveredIdx === idx) {
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#181c1b';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.pct}%`, x + barWidth / 2, y - 6);
      }

      // Label X Axis
      ctx.fillStyle = hoveredIdx === idx
        ? (document.documentElement.classList.contains('dark') ? '#52bfa6' : '#005146')
        : '#89938e';
      ctx.font = hoveredIdx === idx ? 'bold 10px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, paddingTop + chartHeight + 16);
    });
  }, [hoveredIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const paddingLeft = 40;
    const paddingRight = 15;
    const chartWidth = rect.width - paddingLeft - paddingRight;
    const barSpacing = chartWidth / data.length;

    const colX = x - paddingLeft;
    if (colX >= 0 && colX < chartWidth) {
      const idx = Math.floor(colX / barSpacing);
      if (idx >= 0 && idx < data.length) {
        if (hoveredIdx !== idx) {
          setHoveredIdx(idx);
        }
        return;
      }
    }
    setHoveredIdx(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5">
          <h5 className="text-sm font-bold text-on-surface dark:text-white flex items-center gap-1.5">
            Desempenho de Adesão Semanal
          </h5>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-outline cursor-pointer hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-neutral-900 text-white text-[10px] p-2.5 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 leading-relaxed font-medium">
              <span className="font-bold block mb-1">Cálculo de Adesão Semanal</span>
              Acompanhamento percentual de conclusão dos treinos prescritos nos últimos 7 dias.
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-[10px] font-semibold text-on-surface-variant dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#59c3b0]" /> &ge;80%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#fbbf24]" /> 65%-79%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" /> &lt;65%
          </span>
        </div>
      </div>

      <div className="relative w-full h-44 bg-surface-container-lowest dark:bg-neutral-900/50 rounded-xl overflow-hidden flex items-center justify-center border border-surface-container dark:border-neutral-800/80">
        <canvas
          id="weekly-adherence"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
          className="w-full h-full cursor-pointer"
        />
        
        {hoveredIdx !== null && (
          <div className="absolute top-2 right-2 bg-neutral-950/95 dark:bg-neutral-900/95 text-white p-2.5 rounded-lg text-[10px] border border-neutral-800 shadow-xl pointer-events-none animate-fade-in z-25">
            <p className="font-bold text-[#52bfa6] mb-0.5">{data[hoveredIdx].label}</p>
            <p>Adesão: <span className="font-semibold">{data[hoveredIdx].pct}%</span></p>
            <p>Concluídos: <span className="font-semibold">{data[hoveredIdx].completed}/{data[hoveredIdx].prescribed} ex.</span></p>
          </div>
        )}
      </div>
    </div>
  );
}


export default WeeklyAdherenceChart;