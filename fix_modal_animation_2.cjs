const fs = require('fs');
let file = fs.readFileSync('src/components/dashboard/PatientRotinaView.tsx', 'utf8');

file = file.replace(
  "{showSuccessModal && <motion.div key=\"backdrop\"\n            {/* Backdrop */}\n            <motion.div",
  "{showSuccessModal && (\n            <motion.div key=\"backdrop\""
);

file = file.replace(
  "            />}\n            {showSuccessModal &&\n            {/* Bottom Sheet container */}\n            <motion.div",
  "            />\n          )}\n          {showSuccessModal && (\n            <motion.div key=\"bottom-sheet\""
);

file = file.replace(
  "                      </button>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </motion.div>\n        }\n</AnimatePresence>,",
  "                      </button>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </motion.div>\n          )}\n</AnimatePresence>,"
);

fs.writeFileSync('src/components/dashboard/PatientRotinaView.tsx', file);
