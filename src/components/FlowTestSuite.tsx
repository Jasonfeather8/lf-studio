import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/uiStore';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Bot,
  AlertTriangle,
  GripVertical,
  Users,
  Dumbbell,
  RefreshCw,
  X,
  Check,
  ClipboardList,
  Copy,
  Terminal,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface Step {
  description: string;
  run: (queryClient: any, store: any, navigate: any) => Promise<void>;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Step[];
}

export default function FlowTestSuite() {
  const queryClient = useQueryClient();
  const store = useUIStore();
  const navigate = useNavigate();

  const [position, setPosition] = useState({ x: 24, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<('pending' | 'running' | 'success' | 'failed')[]>([]);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string>('only-prescription');

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // --- HELPERS DE AUTOMAÇÃO ---
  
  const typeIntoInput = (selector: string, value: string, index: number = 0) => {
    const elements = document.querySelectorAll(selector);
    const el = elements[index] as HTMLInputElement | HTMLTextAreaElement;
    if (!el) throw new Error(`CAMPO NÃO ENCONTRADO: ${selector}`);
    
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      "value"
    )?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const clickElement = (selector: string, textContext?: string) => {
    let el: HTMLElement | null = null;
    if (textContext) {
      const buttons = Array.from(document.querySelectorAll(selector));
      el = buttons.find(b => b.textContent?.includes(textContext)) as HTMLElement;
    } else {
      el = document.querySelector(selector) as HTMLElement;
    }
    if (!el) throw new Error(`BOTÃO NÃO ENCONTRADO: ${textContext || selector}`);
    el.click();
  };

  // --- DEFINIÇÃO DOS TESTES ---

  const testCases: TestCase[] = [
    {
      id: 'only-prescription',
      name: 'Fluxo 3: Realizar Prescrição Clínica',
      category: 'Prescrição',
      description: 'Testa apenas a criação de treino, assumindo que já existe paciente e exercício cadastrados.',
      steps: [
        {
          description: '1. Acessar Ficha do Primeiro Paciente',
          run: async () => {
            navigate('/patients');
            await delay(1500);
            const rows = document.querySelectorAll('tr[class*="cursor-pointer"]');
            if (rows.length === 0) throw new Error('Não há pacientes na lista para testar a prescrição.');
            (rows[0] as HTMLElement).click();
            await delay(1500);
          }
        },
        {
          description: '2. Abrir e Configurar Novo Treino',
          run: async () => {
            clickElement('#btn-nova-prescricao');
            await delay(1200);
            typeIntoInput('input[placeholder*="Nome do Treino"]', `Protocolo Independente ${Date.now().toString().slice(-4)}`);
            
            // Adicionar primeiro exercício do catálogo e verificar se entrou no resumo
            clickElement('button[title="Adicionar rápido"]');
            await delay(800);
            
            const cartItems = document.querySelectorAll('p[class*="font-black text-neutral-800"]');
            if (cartItems.length === 0) throw new Error('O exercício não foi adicionado ao resumo da prescrição após o clique.');
          }
        },
        {
          description: '3. Salvar e Validar Presença do Card',
          run: async () => {
            clickElement('#btn-salvar-prescricao');
            
            // Espera o formulário fechar e a lista recarregar
            let found = false;
            for (let i = 0; i < 5; i++) { // 5 tentativas (total 5 segundos)
              await delay(1000);
              const cards = document.querySelectorAll('h4');
              if (Array.from(cards).some(c => c.textContent?.includes('Protocolo Independente'))) {
                found = true;
                break;
              }
            }

            if (!found) {
              const isFormStillOpen = !!document.getElementById('btn-salvar-prescricao');
              if (isFormStillOpen) {
                throw new Error('O formulário de prescrição não fechou após o salvamento. Verifique se houve erro no console ou campos obrigatórios vazios.');
              } else {
                throw new Error('O card da prescrição não apareceu na lista mesmo após o formulário fechar. Verifique sincronização de cache.');
              }
            }
          }
        }
      ]
    },
    {
      id: 'full-cycle',
      name: 'MASTER: Ciclo Completo',
      category: 'Sistema',
      description: 'Executa Exercício -> Paciente -> Prescrição em sequência.',
      steps: [
        {
          description: '1. Criar Exercício',
          run: async () => {
            navigate('/exercises');
            await delay(1200);
            clickElement('button', 'Novo Exercício');
            await delay(800);
            typeIntoInput('input[placeholder*="Ex: Agachamento"]', 'Exercício Ciclo Master');
            typeIntoInput('textarea', 'Instruções automáticas.');
            clickElement('button', 'Elástico');
            clickElement('button', 'Salvar Exercício');
            await delay(3000);
          }
        },
        {
          description: '2. Cadastrar Paciente',
          run: async () => {
            navigate('/patients');
            await delay(1200);
            clickElement('#add-patient-btn');
            await delay(1000);
            const id = Date.now().toString().slice(-4);
            typeIntoInput('input[placeholder*="João"]', `Aluno Master ${id}`);
            typeIntoInput('input[placeholder*="000.000"]', '000.000.000-00');
            typeIntoInput('input[type="email"]', `master_${id}@teste.com`);
            typeIntoInput('input[placeholder="••••••••"]', 'Senha123!', 0);
            typeIntoInput('input[placeholder="••••••••"]', 'Senha123!', 1);
            clickElement('button[type="submit"]', 'Salvar Paciente');
            await delay(4500);
          }
        },
        {
          description: '3. Realizar Prescrição',
          run: async () => {
            const rows = document.querySelectorAll('tr[class*="cursor-pointer"]');
            (rows[0] as HTMLElement).click();
            await delay(1500);
            clickElement('#btn-nova-prescricao');
            await delay(1200);
            typeIntoInput('input[placeholder*="Nome do Treino"]', 'Treino Master');
            clickElement('button[title="Adicionar rápido"]');
            clickElement('#btn-salvar-prescricao');
            await delay(3000);
          }
        }
      ]
    }
  ];

  // --- LÓGICA DE INTERFACE ---

  const activeTestCase = testCases.find(tc => tc.id === selectedTestCaseId) || testCases[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };

  const handleRunTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setErrorDetails(null);

    const statuses: ('pending' | 'running' | 'success' | 'failed')[] = activeTestCase.steps.map(() => 'pending');
    setStepStatuses(statuses);

    for (let i = 0; i < activeTestCase.steps.length; i++) {
      setCurrentStepIndex(i);
      statuses[i] = 'running';
      setStepStatuses([...statuses]);

      try {
        await activeTestCase.steps[i].run(queryClient, store, navigate);
        statuses[i] = 'success';
        setStepStatuses([...statuses]);
      } catch (err: any) {
        statuses[i] = 'failed';
        setStepStatuses([...statuses]);
        setErrorDetails(`ERRO NA ETAPA "${activeTestCase.steps[i].description}":\n\n${err.message}`);
        setIsRunning(false);
        return;
      }
    }
    setIsRunning(false);
  };

  return (
    <>
      <div style={{ left: position.x, top: position.y }} className="fixed z-[9999] flex items-center bg-neutral-900/95 backdrop-blur-md rounded-full px-3 py-2 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
        <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => setIsDragging(false)} className="cursor-move pr-2 text-neutral-600 hover:text-green-400 py-1 touch-none">
          <GripVertical size={16} />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
          <Database size={14} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Validando...' : 'Flow Test Suite'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-40 left-10 z-[9998] w-96 bg-neutral-950 text-white rounded-[32px] border border-neutral-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[75vh]"
          >
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-green-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-green-500">Auto-Integridade</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-4 bg-neutral-900/20 border-b border-neutral-800">
              <select
                value={selectedTestCaseId}
                onChange={(e) => setSelectedTestCaseId(e.target.value)}
                disabled={isRunning}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-200 outline-none focus:border-green-500/50"
              >
                {testCases.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
              </select>
              <p className="text-[10px] text-neutral-500 mt-3 px-1 font-medium italic">
                "{activeTestCase.description}"
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                {activeTestCase.steps.map((step, idx) => {
                  const status = stepStatuses[idx] || 'pending';
                  return (
                    <div key={idx} className="relative pl-9 flex items-start gap-3">
                      <div className={`absolute left-0 w-[24px] h-[24px] rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${
                        status === 'success' ? 'bg-green-600 border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]' :
                        status === 'running' ? 'bg-neutral-900 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                        status === 'failed' ? 'bg-red-600 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'bg-neutral-950 border-neutral-800'
                      }`}>
                        {status === 'success' ? <Check size={14} className="text-white stroke-[3px]" /> :
                         status === 'running' ? <Loader2 size={14} className="text-amber-500 animate-spin" /> :
                         status === 'failed' ? <X size={14} className="text-white" /> : null}
                      </div>
                      <span className={`text-[12px] font-black ${status === 'running' ? 'text-amber-400' : status === 'failed' ? 'text-red-400' : 'text-neutral-600'}`}>
                        {step.description}
                      </span>
                    </div>
                  );
                })}
              </div>

              {errorDetails && (
                <div className="mt-4 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-black uppercase">Ruptura Detectada</span>
                  </div>
                  <pre className="text-[10px] text-red-300/80 font-mono leading-relaxed bg-black/40 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                    {errorDetails}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-800 bg-neutral-900/30 flex gap-3">
              <button onClick={() => { setStepStatuses([]); setErrorDetails(null); }} disabled={isRunning} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400"><RefreshCw size={20} /></button>
              <button
                onClick={handleRunTest}
                disabled={isRunning}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                <span>Iniciar Teste</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}