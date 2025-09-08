import React, { useState } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Trash2, Calendar, Clock } from 'lucide-react';
import { PDFGenerator } from './utils/pdfGenerator';

interface TranslationJob {
  id: string;
  fileName: string;
  status: 'uploading' | 'translating' | 'completed' | 'error';
  progress: number;
  uploadTime: Date;
  fileBlob?: Blob;
  translatedFileName?: string;
  errorMessage?: string;
}

function App() {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'downloads'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);

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
    };

    setJobs(prev => [newJob, ...prev]);

    // 開始翻譯處理
    await simulateTranslation(jobId);
  };

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

      // 從狀態中獲取當前任務信息
      let currentJob: TranslationJob | undefined;
      setJobs(prev => {
        currentJob = prev.find(job => job.id === jobId);
        return prev;
      });
      
      if (!currentJob) {
        throw new Error('找不到翻譯任務');
      }
      
      // 生成翻譯內容
      const translatedContent = await PDFGenerator.simulateTranslation(currentJob.fileName);
      
      // 生成文件
      const fileBlob = await PDFGenerator.createTranslatedPDF(
        currentJob.fileName,
        translatedContent
      );
      
      const translatedFileName = `translated_${currentJob.fileName.replace('.pdf', '.html')}`;
      
      // 完成任務
      updateJob({ 
        status: 'completed', 
        progress: 100
      });
      
      alert(`${currentJob.fileName} 已成功翻譯完成！`);
      
    } catch (error) {
      console.error('翻譯失敗:', error);
      updateJob({ 
        status: 'error', 
        progress: 0,
        errorMessage: (error as Error).message || '翻譯過程中發生未知錯誤'
      });
      alert((error as Error).message || '處理文件時發生錯誤，請重試。');
    }
  };

  const handleDownload = async (job: TranslationJob) => {
    if (job.status !== 'completed') {
      alert('翻譯尚未完成，請稍候');
      return;
    }

    try {
      // 重新生成翻譯內容
      const translatedContent = await PDFGenerator.simulateTranslation(job.fileName);
      
      // 在新視窗中顯示翻譯內容
      const success = await PDFGenerator.displayTranslatedContent(translatedContent, job.fileName);
      
      if (success) {
        // 不需要顯示alert，因為內容已經在新視窗中打開
      } else {
        alert('無法顯示翻譯內容，請檢查瀏覽器的彈出視窗設定');
      }
    } catch (error) {
      console.error('顯示翻譯內容時發生錯誤：', error);
      alert(`顯示內容時發生錯誤：${(error as Error).message}`);
    }
  };

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
              {/* Upload Area */}
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

              {/* Jobs List */}
              {jobs.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                    翻譯任務
                  </h2>
                  {jobs.map((job) => (
                    <div key={job.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          {getStatusIcon(job.status)}
                          <div style={{ marginLeft: '12px', flex: 1 }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                              {job.fileName}
                            </h4>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                              {getStatusText(job.status)}
                            </p>
                            {job.errorMessage && (
                              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                                {job.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {job.status === 'completed' && (
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleDownload(job)}
                              style={{ padding: '6px 12px', fontSize: '14px' }}
                            >
                              <Download size={16} />
                              下載
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {(job.status === 'uploading' || job.status === 'translating') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div 
                              className="progress-fill"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', minWidth: '35px' }}>
                            {job.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              <div className="card" style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                  功能特色
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    '保持原有PDF格式和排版',
                    '智能識別表格和圖片',
                    '高品質中文翻譯',
                    '快速處理和下載',
                    '輸出HTML格式（可轉換為PDF）'
                  ].map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle size={20} color="#10b981" />
                      <span style={{ fontSize: '16px', color: '#374151' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                翻譯記錄
              </h2>
              {jobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                  <FileText size={64} color="#d1d5db" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    暫無翻譯記錄
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    上傳您的第一個PDF文件開始翻譯
                  </p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                        <FileText size={24} color="#3b82f6" />
                        <div style={{ marginLeft: '12px', flex: 1 }}>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                            {job.fileName}
                          </h4>
                          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} color="#6b7280" />
                              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                {formatDate(job.uploadTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: job.status === 'completed' ? '#d1fae5' : '#fee2e2',
                        color: job.status === 'completed' ? '#065f46' : '#991b1b',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {getStatusText(job.status)}
                      </div>
                      {job.status === 'completed' && (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleDownload(job)}
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          <Download size={16} />
                          下載
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'downloads' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
                下載中心
              </h2>
              
              {/* Stats */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                      {jobs.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      總文件數
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                      {jobs.filter(j => j.status === 'completed').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      可下載
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                      {jobs.filter(j => j.status === 'translating').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      處理中
                    </div>
                  </div>
                </div>
              </div>

              {jobs.filter(job => job.status === 'completed').length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                  <Download size={64} color="#d1d5db" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    暫無可下載文件
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    完成翻譯後的文件將出現在這裡
                  </p>
                </div>
              ) : (
                jobs.filter(job => job.status === 'completed').map((job) => (
                  <div key={job.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                        <FileText size={24} color="#3b82f6" />
                        <div style={{ marginLeft: '12px', flex: 1 }}>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            {job.translatedFileName}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                            原文件：{job.fileName}
                          </p>
                          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                            {formatDate(job.uploadTime)}
                          </p>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleDownload(job)}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        <Download size={16} />
                        下載
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;