const fs = require('fs');

let file = fs.readFileSync('src/components/DeleteConfirmModal.tsx', 'utf8');

file = file.replace("if (!isOpen) return null;", "");
file = file.replace(
  "return (\n    <AnimatePresence>\n      <div",
  "return (\n    <AnimatePresence>\n      {isOpen && (\n      <div"
);
file = file.replace(
  "        </motion.div>\n      </div>\n    </AnimatePresence>",
  "        </motion.div>\n      </div>\n      )}\n    </AnimatePresence>"
);

fs.writeFileSync('src/components/DeleteConfirmModal.tsx', file);
