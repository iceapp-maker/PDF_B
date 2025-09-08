import React, { useState } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { PDFGenerator } from './utils/pdfGenerator';
import { SVGPdfGenerator } from './utils/svgPdfGenerator';

interface TranslationJob {
  id: string;
  fileName: string;
  status: 'uploading' | 'translating' | 'completed' | 'error';
  progress: number;
  uploadTime: Date;
  fileBlob?: Blob;
  translatedFileName?: string;
  errorMessage?: string;
  outputFormat?: 'html' | 'svg'; // 新增輸出格式
}

function App() {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'downloads'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'html' | 'svg'>('html'); // 新增格式選擇

  const handleFileUpload = async (file?: File) => {
    let selectedFile = file;
    
    if (!selectedFile) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files[0]) {
          processFile(files[0]);
        }
      };
      input.click();
      return;
    }

    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    // 文件驗證
    if (file.type !== 'application/pdf') {
      alert('請選擇PDF格式的文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('文件大小不能超過50MB');
      return;
    }

    const jobId = Date.now().toString();
    const newJob: TranslationJob = {
      id: jobId,
      fileName: file.name,
      status: 'uploading',
      progress: 0,
      uploadTime: new Date(),
      outputFormat: outputFormat, // 記錄選擇的格式
    };

    setJobs(prev => [newJob, ...prev]);

    // 開始翻譯處理
    await simulateTranslation(jobId);
  };

  // 在 App.tsx 的 simulateTranslation 函數中添加更好的錯誤處理

const simulateTranslation = async (jobId: string) => {
  const updateJob = (updates: Partial<TranslationJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  try {
    // 模擬上傳進度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      updateJob({ progress: i });
    }

    updateJob({ status: 'translating', progress: 0 });

    // 模擬翻譯進度
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      updateJob({ progress: i });
    }

    // 獲取當前任務信息
    const currentJob = jobs.find(job => job.id === jobId);
    if (!currentJob) {
      throw new Error('找不到翻譯任務');
    }
    
    // 生成翻譯內容
    const translatedContent = await PDFGenerator.simulateTranslation(currentJob.fileName);
    
    // 根據選擇的格式生成文件
    let fileBlob: Blob;
    let translatedFileName: string;
    
    try {
      if (currentJob.outputFormat === 'svg') {
        // 檢查 SVGPdfGenerator 是否可用
        if (typeof SVGPdfGenerator === 'undefined') {
          throw new Error('SVGPdfGenerator 未正確載入，請檢查檔案是否存在');
        }
        
        fileBlob = await SVGPdfGenerator.createSVGTranslatedPDF(
          currentJob.fileName,
          translatedContent
        );
        translatedFileName = `translated_${currentJob.fileName.replace('.pdf', '_svg.html')}`;
      } else {
        fileBlob = await PDFGenerator.createTranslatedPDF(
          currentJob.fileName,
          translatedContent
        );
        translatedFileName = `translated_${currentJob.fileName.replace('.pdf', '.html')}`;
      }
    } catch (generatorError) {
      console.error('文件生成錯誤:', generatorError);
      throw new Error(`文件生成失敗: ${generatorError.message}`);
    }
    
    // 完成任務
    updateJob({ 
      status: 'completed', 
      progress: 100,
      fileBlob: fileBlob,
      translatedFileName: translatedFileName
    });
    
    const formatText = currentJob.outputFormat === 'svg' ? 'SVG格式' : 'HTML格式';
    alert(`${currentJob.fileName} 已成功翻譯完成！\n輸出格式：${formatText}`);
    
  } catch (error) {
    console.error('翻譯失敗:', error);
    updateJob({ 
      status: 'error', 
      progress: 0,
      errorMessage: error instanceof Error ? error.message : '翻譯過程中發生未知錯誤'
    });
    
    // 顯示更詳細的錯誤訊息
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    alert(`處理文件時發生錯誤：${errorMessage}\n\n請檢查：\n1. 是否已創建 svgPdfGenerator.ts 檔案\n2. 瀏覽器控制台是否有其他錯誤訊息`);
  }
};
  const handleDownload = async (job: TranslationJob) => {
    if (!job.fileBlob || !job.translatedFileName) {
      alert('文件尚未準備好');
      return;
    }

    try {
      const success = await PDFGenerator.downloadPDF(job.fileBlob, job.translatedFileName);
      
      if (success) {
        const formatText = job.outputFormat === 'svg' ? 'SVG格式的HTML' : '標準HTML';
        alert(`${job.translatedFileName} 已下載到您的電腦\n\n格式：${formatText}\n注意：文件格式為HTML，可用瀏覽器打開查看，或使用瀏覽器的打印功能另存為PDF。`);
      } else {
        alert('下載失敗，請重試');
      }
    } catch (error) {
      alert(`下載錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  // ... 其他函數保持不變 ...
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: TranslationJob['status']) => {
    switch (status) {
      case 'uploading':
      case 'translating':
        return <Upload size={20} color="#3B82F6" />;
      case 'completed':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <AlertCircle size={20} color="#EF4444" />;
    }
  };

  const getStatusText = (status: TranslationJob['status']) => {
    switch (status) {
      case 'uploading':
        return '上傳中...';
      case 'translating':
        return '翻譯中...';
      case 'completed':
        return '翻譯完成';
      case 'error':
        return '翻譯失敗';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            PDF 中文翻譯工具
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            上傳PDF文件，自動翻譯成中文並保持原有格式
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { key: 'upload', label: '上傳翻譯', icon: Upload },
              { key: 'history', label: '翻譯記錄', icon: FileText },
              { key: 'downloads', label: '下載中心', icon: Download }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  border: 'none',
                  backgroundColor: activeTab === key ? '#eff6ff' : 'transparent',
                  color: activeTab === key ? '#3b82f6' : '#6b7280',
                  borderBottom: activeTab === key ? '2px solid #3b82f6' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ padding: '40px 0' }}>
        <div className="container">
          {activeTab === 'upload' && (
            <div>
              {/* Format Selection */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={20} />
                  輸出格式設定
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="outputFormat"
                      value="html"
                      checked={outputFormat === 'html'}
                      onChange={(e) => setOutputFormat(e.target.value as 'html' | 'svg')}
                      style={{ accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>標準 HTML（快速、輕量）</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="outputFormat"
                      value="svg"
                      checked={outputFormat === 'svg'}
                      onChange={(e) => setOutputFormat(e.target.value as 'html' | 'svg')}
                      style={{ accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>SVG 格式（保持版面佈局）</span>
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  {outputFormat === 'svg' 
                    ? '💡 SVG 格式會嘗試保持原始 PDF 的版面佈局和視覺格式'
                    : '💡 標準 HTML 格式處理速度快，適合純文字內容'
                  }
                </p>
              </div>

              {/* Upload Area - 保持原有代碼 */}
              <div 
                className="card"
                style={{
                  border: '2px dashed #e5e7eb',
                  borderColor: isDragOver ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: isDragOver ? '#eff6ff' : 'white',
                  textAlign: 'center',
                  padding: '60px 40px',
                  cursor: 'pointer'
                }}
                onClick={() => handleFileUpload()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FileText size={48} color="#9ca3af" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  點擊上傳或拖拽PDF文件
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  支援格式：PDF｜最大文件大小：50MB
                </p>
                <button className="btn btn-primary">
                  <Upload size={20} />
                  選擇文件
                </button>
              </div>

              {/* 其餘 UI 代碼保持不變... */}
              {/* Jobs List, Features 等區塊保持原有代碼 */}
            </div>
          )}

          {/* 其他 tab 內容保持不變... */}
        </div>
      </main>
    </div>
  );
}

export default App;