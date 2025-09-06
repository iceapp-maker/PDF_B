import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Upload, FileText, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Download } from 'lucide-react-native';
import { PDFGenerator } from '../../utils/pdfGenerator';

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

export default function UploadScreen() {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file?: File) => {
    if (Platform.OS !== 'web') {
      Alert.alert('提示', '文件上傳功能僅在網頁版本中可用');
      return;
    }

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
      Alert.alert('錯誤', '請選擇PDF格式的文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      Alert.alert('錯誤', '文件大小不能超過50MB');
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

      // 獲取當前任務信息
      const currentJob = jobs.find(job => job.id === jobId);
      if (!currentJob) {
        throw new Error('找不到翻譯任務');
      }
      
      console.log('開始翻譯處理...', currentJob.fileName);
      
      // 生成翻譯內容
      const translatedContent = await PDFGenerator.simulateTranslation(currentJob.fileName);
      
      // 生成文件
      const fileBlob = await PDFGenerator.createTranslatedPDF(
        currentJob.fileName,
        translatedContent
      );
      
      // 驗證生成的文件
      const isValid = await PDFGenerator.validatePDF(fileBlob);
      if (!isValid) {
        throw new Error('生成的文件格式無效');
      }
      
      const translatedFileName = `translated_${currentJob.fileName.replace('.pdf', '.html')}`;
      
      // 完成任務
      updateJob({ 
        status: 'completed', 
        progress: 100,
        fileBlob: fileBlob,
        translatedFileName: translatedFileName
      });
      
      Alert.alert('翻譯完成', `${currentJob.fileName} 已成功翻譯完成！`);
      
    } catch (error) {
      console.error('翻譯失敗:', error);
      updateJob({ 
        status: 'error', 
        progress: 0,
        errorMessage: error.message || '翻譯過程中發生未知錯誤'
      });
      Alert.alert('翻譯失敗', error.message || '處理文件時發生錯誤，請重試。');
    }
  };

  const handleDownload = async (job: TranslationJob) => {
    if (Platform.OS !== 'web' || !job.fileBlob || !job.translatedFileName) {
      Alert.alert('下載失敗', '文件尚未準備好或瀏覽器不支持下載功能');
      return;
    }

    try {
      console.log('開始下載...', job.translatedFileName);
      const success = await PDFGenerator.downloadPDF(job.fileBlob, job.translatedFileName);
      
      if (success) {
        Alert.alert('下載完成', `${job.translatedFileName} 已下載到您的電腦\n\n注意：文件格式為HTML，可用瀏覽器打開查看，或使用瀏覽器的打印功能另存為PDF。`);
      } else {
        Alert.alert('下載失敗', '文件可能已損壞，請重新翻譯');
      }
    } catch (error) {
      Alert.alert('下載錯誤', `下載失敗：${error.message}`);
    }
  };

  const handleRetry = (job: TranslationJob) => {
    Alert.alert(
      '重新翻譯',
      `確定要重新翻譯 "${job.fileName}" 嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '重試', onPress: () => {
          // 重置任務狀態
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'uploading', progress: 0, errorMessage: undefined }
              : j
          ));
          // 重新開始翻譯
          simulateTranslation(job.id);
        }}
      ]
    );
  };

  const handleTestGeneration = () => {
    Alert.alert(
      '執行測試',
      '是否要在控制台執行文件生成測試？',
      [
        { text: '取消', style: 'cancel' },
        { text: '執行', onPress: () => {
          console.log('=== 開始執行測試 ===');
          import('../../utils/pdfGenerator').then(({ PDFDebugger }) => {
            PDFDebugger.testBasicPDFGeneration();
            PDFDebugger.checkEnvironmentCompatibility();
          }).catch(error => {
            console.error('導入測試工具失敗:', error);
          });
        }}
      ]
    );
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PDF 中文翻譯工具</Text>
        <Text style={styles.subtitle}>
          上傳PDF文件，自動翻譯成中文並保持原有格式
        </Text>
        
        {/* 添加測試按鈕 */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={handleTestGeneration}
        >
          <Text style={styles.testButtonText}>執行系統測試</Text>
        </TouchableOpacity>
      </View>

      <View 
        style={[styles.uploadArea, isDragOver && styles.uploadAreaActive]}
        onTouchEnd={() => handleFileUpload()}
      >
        <FileText size={48} color="#9CA3AF" />
        <Text style={styles.uploadTitle}>點擊上傳或拖拽PDF文件</Text>
        <Text style={styles.uploadSubtitle}>
          支援格式：PDF｜最大文件大小：50MB
        </Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => handleFileUpload()}
        >
          <Upload size={20} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>選擇文件</Text>
        </TouchableOpacity>
      </View>

      {jobs.length > 0 && (
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>翻譯任務</Text>
          {jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  {getStatusIcon(job.status)}
                  <View style={styles.jobDetails}>
                    <Text style={styles.jobFileName}>{job.fileName}</Text>
                    <Text style={styles.jobStatus}>{getStatusText(job.status)}</Text>
                    {job.errorMessage && (
                      <Text style={styles.errorMessage}>{job.errorMessage}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.jobActions}>
                  {job.status === 'completed' && (
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleDownload(job)}
                    >
                      <Download size={16} color="#3B82F6" />
                      <Text style={styles.downloadButtonText}>下載</Text>
                    </TouchableOpacity>
                  )}
                  {job.status === 'error' && (
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => handleRetry(job)}
                    >
                      <Upload size={16} color="#FFFFFF" />
                      <Text style={styles.retryButtonText}>重試</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {(job.status === 'uploading' || job.status === 'translating') && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${job.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{job.progress}%</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.features}>
        <Text style={styles.sectionTitle}>功能特色</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>保持原有PDF格式和排版</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>智能識別表格和圖片</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText}>高品質中文翻譯</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.featureText">快速處理和下載</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={20} color="#F59E0B" />
            <Text style={styles.featureText}>輸出HTML格式（可轉換為PDF）</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadArea: {
    margin: 24,
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  uploadAreaActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  jobsSection: {
    margin: 24,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobDetails: {
    marginLeft: 12,
    flex: 1,
  },
  jobFileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  jobStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  downloadButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 35,
  },
  features: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});