const fs = require('fs');

let file = fs.readFileSync('src/components/Modal.tsx', 'utf8');

file = file.replace("if (!isOpen) return null;", "");
file = file.replace(
  "return createPortal(\n    <AnimatePresence>\n      <div",
  "return createPortal(\n    <AnimatePresence>\n      {isOpen && (\n      <div"
);
file = file.replace(
  "        </motion.div>\n      </div>\n    </AnimatePresence>,",
  "        </motion.div>\n      </div>\n      )}\n    </AnimatePresence>,"
);

fs.writeFileSync('src/components/Modal.tsx', file);
