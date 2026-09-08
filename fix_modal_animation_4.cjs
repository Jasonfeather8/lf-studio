const fs = require('fs');
let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

file = file.replace(/<AnimatePresence>([\s\S]*?)<\/AnimatePresence>/g, (match) => {
  if (match.includes("backdrop-blur-xs") && match.includes("success")) {
    return `<AnimatePresence>
        {showSuccessModal && (
          <motion.div key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
            className="fixed inset-0 bg-neutral-950/60 dark:bg-neutral-950/80 z-[100] backdrop-blur-xs"
          />
        )}
        {showSuccessModal && (
          <motion.div key="bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-neutral-900 border-t border-neutral-150 dark:border-neutral-800 rounded-t-[32px] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-[101] overflow-y-auto max-h-[90vh] pb-10"
          >
            {/* Handle bar for dragging visual */}
            <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-5" />

            {/* Content */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/10">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Excelente!</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Mais um exercício pra conta. Continue assim!
                </p>
              </div>

              {/* Weekly Progress Mini-Widget inside Success Modal */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 mt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Progresso Semanal</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{weeklyCompletedCount}/7 treinos</span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: \`\${(weeklyCompletedCount / 7) * 100}%\` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm rounded-xl transition-colors"
                >
                  Continuar Treino
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>`;
  }
  return match;
});

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
