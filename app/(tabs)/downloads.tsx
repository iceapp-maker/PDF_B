import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Download, FileText, ExternalLink, Trash2, CircleCheck as CheckCircle, Clock } from 'lucide-react-native';
import { PDFGenerator } from '../../utils/pdfGenerator';

interface DownloadItem {
  id: string;
  fileName: string;
  originalFileName: string;
  fileSize: string;
  downloadDate: Date;
  status: 'ready' | 'downloading' | 'completed';
  progress?: number;
  pdfBlob?: Blob;
}

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  
  // 初始化示例數據
  React.useEffect(() => {
    const initializeDownloads = async () => {
      const sampleDownloads: DownloadItem[] = [];
      
      const fileNames = [
        { original: '商業計劃書.pdf', translated: 'translated_商業計劃書.pdf' },
        { original: '技術文檔.pdf', translated: 'translated_技術文檔.pdf' },
        { original: '用戶手冊.pdf', translated: 'translated_用戶手冊.pdf' },
      ];
      
      for (let i = 0; i < fileNames.length; i++) {
        const file = fileNames[i];
        try {
          const translatedContent = await PDFGenerator.simulateTranslation(file.original);
          const pdfBlob = await PDFGenerator.createTranslatedPDF(file.original, translatedContent);
          
          sampleDownloads.push({
            id: (i + 1).toString(),
            fileName: file.translated,
            originalFileName: file.original,
            fileSize: `${(pdfBlob.size / (1024 * 1024)).toFixed(1)} MB`,
            downloadDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            status: i === 1 ? 'completed' : 'ready',
            pdfBlob: pdfBlob,
          });
        } catch (error) {
          console.error('Failed to generate sample PDF:', error);
        }
      }
      
      setDownloads(sampleDownloads);
    };
    
    initializeDownloads();
  }, []);

  const handleDownload = async (item: DownloadItem) => {
    if (Platform.OS !== 'web' || !item.pdfBlob) {
      Alert.alert('提示', '下載功能僅在網頁版本中可用');
      return;
    }

    // Update status to downloading
    setDownloads(prev => prev.map(d => 
      d.id === item.id ? { ...d, status: 'downloading', progress: 0 } : d
    ));

    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setDownloads(prev => prev.map(d => 
        d.id === item.id ? { ...d, progress: i } : d
      ));
    }

    // Complete download
    setDownloads(prev => prev.map(d => 
      d.id === item.id ? { ...d, status: 'completed', progress: 100 } : d
    ));

    // 實際文件下載
    const link = document.createElement('a');
    const url = URL.createObjectURL(item.pdfBlob);
    link.href = url;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL對象
    setTimeout(() => URL.revokeObjectURL(url), 100);

    Alert.alert('下載完成', `${item.fileName} 已下載到您的電腦`);
  };

  const handleOpenFile = (item: DownloadItem) => {
    if (Platform.OS === 'web' && item.pdfBlob) {
      const url = URL.createObjectURL(item.pdfBlob);
      window.open(url, '_blank');
      
      // 延遲清理URL對象，給瀏覽器時間打開文件
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      Alert.alert('無法開啟', '文件尚未準備好或瀏覽器不支持此功能');
    }
  };

  const handleDelete = (item: DownloadItem) => {
    Alert.alert(
      '確認刪除',
      `確定要從下載列表中移除 "${item.fileName}" 嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: () => {
          setDownloads(prev => prev.filter(d => d.id !== item.id));
          Alert.alert('已刪除', '文件已從下載列表中移除');
        }},
      ]
    );
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

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'ready':
        return <Download size={20} color="#3B82F6" />;
      case 'downloading':
        return <Clock size={20} color="#F59E0B" />;
      case 'completed':
        return <CheckCircle size={20} color="#10B981" />;
    }
  };

  const getStatusText = (status: DownloadItem['status']) => {
    switch (status) {
      case 'ready':
        return '準備下載';
      case 'downloading':
        return '下載中...';
      case 'completed':
        return '已下載';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>下載中心</Text>
        <Text style={styles.subtitle}>
          管理您的翻譯文件下載
        </Text>
      </View>

      <View style={styles.content}>
        {downloads.length === 0 ? (
          <View style={styles.emptyState}>
            <Download size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>暫無下載文件</Text>
            <Text style={styles.emptySubtitle}>
              完成翻譯後的文件將出現在這裡
            </Text>
          </View>
        ) : (
          <View style={styles.downloadList}>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{downloads.length}</Text>
                <Text style={styles.statLabel}>總文件數</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {downloads.filter(d => d.status === 'ready').length}
                </Text>
                <Text style={styles.statLabel}>待下載</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {downloads.filter(d => d.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>已完成</Text>
              </View>
            </View>

            {downloads.map((item) => (
              <View key={item.id} style={styles.downloadCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.fileInfo}>
                    <FileText size={24} color="#3B82F6" />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName}>{item.fileName}</Text>
                      <Text style={styles.originalFileName}>
                        原文件：{item.originalFileName}
                      </Text>
                      <Text style={styles.downloadDate}>
                        {formatDate(item.downloadDate)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    {item.status === 'ready' && (
                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => handleDownload(item)}
                      >
                        <Download size={16} color="#FFFFFF" />
                        <Text style={styles.downloadButtonText}>下載</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'completed' && (
                      <TouchableOpacity
                        style={styles.openButton}
                        onPress={() => handleOpenFile(item)}
                      >
                        <ExternalLink size={16} color="#3B82F6" />
                        <Text style={styles.openButtonText}>開啟</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.statusContainer}>
                    <View style={styles.statusInfo}>
                      {getStatusIcon(item.status)}
                      <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                    <Text style={styles.fileSize}>{item.fileSize}</Text>
                  </View>

                  {item.status === 'downloading' && item.progress !== undefined && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${item.progress}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{item.progress}%</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
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
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  downloadList: {
    gap: 16,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  downloadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  originalFileName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  downloadDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  openButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  cardBody: {
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
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
});