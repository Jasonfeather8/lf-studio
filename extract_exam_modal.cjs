const fs = require('fs');
let content = fs.readFileSync('src/pages/PatientExams.tsx', 'utf8');

const modalStart = content.indexOf('{/* New Document Upload Modal (Recommendation 1) */}');
const previewModalStart = content.indexOf('{/* Quick Preview Diagnostic Modal (Recommendation 3) */}');

if (modalStart > -1 && previewModalStart > -1) {
    let modalCode = content.substring(modalStart, previewModalStart);
    // Replace it in the original content
    content = content.substring(0, modalStart) + 
              '<UploadExamModal \n        isOpen={modalOpen}\n        onClose={() => setModalOpen(false)}\n        isUploading={isUploading}\n        uploadProgress={uploadProgress}\n        selectedFile={selectedFile}\n        newTitle={newTitle}\n        setNewTitle={setNewTitle}\n        handleFileSelect={handleFileSelect}\n        handleUpload={handleUpload}\n        fileInputRef={fileInputRef}\n      />\n      ' + 
              content.substring(previewModalStart);
              
    if (!content.includes('UploadExamModal')) {
       content = content.replace("import Modal from '../components/Modal';", "import Modal from '../components/Modal';\nimport UploadExamModal from '../components/exams/UploadExamModal';");
    }
    fs.writeFileSync('src/pages/PatientExams.tsx', content);
    
    let modalFile = `import React from 'react';
import Modal from '../Modal';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isUploading: boolean;
  uploadProgress: number | null;
  selectedFile: File | null;
  newTitle: string;
  setNewTitle: (val: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export default function UploadExamModal({
  isOpen, onClose, isUploading, uploadProgress, selectedFile, newTitle, setNewTitle, handleFileSelect, handleUpload, fileInputRef
}: Props) {
  return (
    ${modalCode}
  );
}
`;
    // We need to remove the first `<Modal` line and its matching `</Modal>` because they are now the return statement.
    // Actually `return ( \n ${modalCode} )` is fine because modalCode includes `<Modal ...>`
    fs.writeFileSync('src/components/exams/UploadExamModal.tsx', modalFile);
}
