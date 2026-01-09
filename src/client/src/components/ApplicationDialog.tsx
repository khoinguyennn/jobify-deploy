'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Upload,
  FileText,
  X
} from 'lucide-react';
import { Job } from '@/types';
import { useApplyJob, ApplyJobData } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'tiptap-bullet-list',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'tiptap-ordered-list',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'tiptap-list-item',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Sync content with editor when content prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor content */}
      <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
      
    </div>
  );
};

const ApplicationDialog: React.FC<ApplicationDialogProps> = ({ isOpen, onClose, job }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { user } = useAuth();
  const applyJobMutation = useApplyJob();
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setName('');
      setEmail('');
      setPhone('');
      setCoverLetter('');
      setCvFile(null);
    }
  }, [isOpen]);

  const handleFileSelect = (file: File) => {
    // Check file type
    if (!(file.type === 'application/pdf' || file.type.includes('word') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      showToast.warning('Chỉ chấp nhận file PDF hoặc Word');
      return;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showToast.error('File CV không được vượt quá 5MB');
      return;
    }
    
    setCvFile(file);
    showToast.success(`Đã chọn file: ${file.name}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!job) return;
    
    // Validate required fields
    if (!name.trim()) {
      showToast.error('Vui lòng nhập tên hiển thị');
      return;
    }
    
    if (!email.trim()) {
      showToast.error('Vui lòng nhập email');
      return;
    }
    
    if (!phone.trim()) {
      showToast.error('Vui lòng nhập số điện thoại');
      return;
    }
    
    if (!coverLetter.trim()) {
      showToast.error('Vui lòng nhập thư xin việc');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Email không hợp lệ');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      showToast.error('Số điện thoại không hợp lệ (10-11 chữ số)');
      return;
    }

    const applyData: ApplyJobData = {
      idJob: job.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      coverLetter: coverLetter,
      cv: cvFile || undefined,
    };

    try {
      await applyJobMutation.mutateAsync(applyData);
      onClose();
      // Form will be reset automatically by useEffect when dialog closes
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const removeCvFile = () => {
    setCvFile(null);
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto custom-application-dialog custom-wide-dialog px-8 py-8"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Ứng tuyển: {job.nameJob}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {job.company?.nameCompany}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="applicant-name" className="text-sm font-medium text-gray-700 mb-2 block">
                Tên hiển thị với nhà tuyển dụng *
              </Label>
              <Input
                id="applicant-name"
                type="text"
                placeholder="Họ và tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                disabled={applyJobMutation.isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="applicant-email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email hiển thị với nhà tuyển dụng *
              </Label>
              <Input
                id="applicant-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={applyJobMutation.isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="applicant-phone" className="text-sm font-medium text-gray-700 mb-2 block">
                Số điện thoại hiển thị với nhà tuyển dụng *
              </Label>
              <Input
                id="applicant-phone"
                type="tel"
                placeholder="0123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
                disabled={applyJobMutation.isPending}
              />
            </div>
          </div>

          {/* CV Upload Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tài CV lên
            </Label>
            
            {cvFile ? (
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{cvFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeCvFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Tài CV từ máy tính lên, chọn hoặc kéo thả.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Chấp nhận file PDF, DOC, DOCX (tối đa 5MB)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cv-upload')?.click()}
                >
                  Chọn CV
                </Button>
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Cover Letter Section */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Thư xin việc *
            </Label>
            <TiptapEditor
              content={coverLetter}
              onChange={setCoverLetter}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={applyJobMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={applyJobMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {applyJobMutation.isPending ? 'Đang gửi...' : 'Nộp đơn ngay'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDialog;

// CSS styles cho nút đóng dialog đẹp hơn và chiều rộng + TipTap editor
const dialogCloseStyles = `
  .custom-wide-dialog {
    width: 75vw !important;
    max-width: 1000px !important;
  }
  
  .custom-application-dialog [data-slot="dialog-close"] {
    top: 20px !important;
    right: 20px !important;
    width: 36px !important;
    height: 36px !important;
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
    opacity: 0.7 !important;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  }

  .tiptap-editor .tiptap ul {
    list-style-type: disc !important;
    margin-left: 1.5rem !important;
    margin: 0.5rem 0 !important;
  }
  
  .tiptap-editor .tiptap ol {
    list-style-type: decimal !important;
    margin-left: 1.5rem !important;
    margin: 0.5rem 0 !important;
  }
  
  .tiptap-editor .tiptap li {
    margin: 0.25rem 0 !important;
    padding-left: 0.25rem !important;
  }
  
  .tiptap-editor .tiptap p {
    margin: 0.5rem 0 !important;
  }
  
  .tiptap-editor .tiptap strong {
    font-weight: bold !important;
  }
  
  .tiptap-editor .tiptap em {
    font-style: italic !important;
  }
  
  .tiptap-editor .tiptap u {
    text-decoration: underline !important;
  }

  .custom-application-dialog [data-slot="dialog-close"]:hover {
    background-color: #f1f5f9 !important;
    opacity: 1 !important;
    transform: scale(1.05) !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  }
  
  .custom-application-dialog [data-slot="dialog-close"] svg {
    width: 18px !important;
    height: 18px !important;
    color: #64748b !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'application-dialog-styles';
  let styleElement = document.getElementById(styleId);
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = dialogCloseStyles;
    document.head.appendChild(styleElement);
  }
}