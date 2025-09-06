import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FileText, Download, Trash2, Calendar, Clock } from 'lucide-react-native';

interface HistoryItem {
  id: string;
  originalFileName: string;
  translatedFileName: string;
  uploadDate: Date;
  fileSize: string;
  status: 'completed' | 'failed';
  downloadUrl?: string;
}

export default function HistoryScreen() {
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: '1',
      originalFileName: '商業計劃書.pdf',
      translatedFileName: 'translated_商業計劃書.pdf',
      uploadDate: new Date('2024-01-15T10:30:00'),
      fileSize: '2.5 MB',
      status: 'completed',
      downloadUrl: 'available',
    },
    {
      id: '2',
      originalFileName: '技術文檔.pdf',
      translatedFileName: 'translated_技術文檔.pdf',
      uploadDate: new Date('2024-01-14T15:45:00'),
      fileSize: '1.8 MB',
      status: 'completed',
      downloadUrl: 'available',
    },
    {
      id: '3',
      originalFileName: '研究報告.pdf',
      translatedFileName: 'translated_研究報告.pdf',
      uploadDate: new Date('2024-01-13T09:20:00'),
      fileSize: '4.2 MB',
      status: 'failed',
    },
    {
      id: '4',
      originalFileName: '用戶手冊.pdf',
      translatedFileName: 'translated_用戶手冊.pdf',
      uploadDate: new Date('2024-01-12T14:15:00'),
      fileSize: '3.1 MB',
      status: 'completed',
      downloadUrl: 'available',
    },
  ]);

  const handleDownload = (item: HistoryItem) => {
    Alert.alert('提示', '請前往下載中心查看和下載已完成的翻譯文件');
  };

  const handleDelete = (item: HistoryItem) => {
    Alert.alert(
      '確認刪除',
      `確定要刪除 "${item.originalFileName}" 的翻譯記錄嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '刪除', style: 'destructive', onPress: () => {
          // In real implementation, remove from state
          Alert.alert('已刪除', '翻譯記錄已刪除');
        }},
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>翻譯記錄</Text>
        <Text style={styles.subtitle}>
          查看和管理您的PDF翻譯歷史記錄
        </Text>
      </View>

      <View style={styles.content}>
        {historyItems.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>暫無翻譯記錄</Text>
            <Text style={styles.emptySubtitle}>
              上傳您的第一個PDF文件開始翻譯
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {historyItems.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.fileInfo}>
                    <FileText size={24} color="#3B82F6" />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName}>{item.originalFileName}</Text>
                      <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                          <Calendar size={14} color="#6B7280" />
                          <Text style={styles.metaText}>{formatDate(item.uploadDate)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Clock size={14} color="#6B7280" />
                          <Text style={styles.metaText}>{formatTime(item.uploadDate)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    {item.status === 'completed' && (
                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => handleDownload(item)}
                      >
                        <Download size={16} color="#3B82F6" />
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
                    <View style={[
                      styles.statusBadge,
                      item.status === 'completed' ? styles.statusSuccess : styles.statusError
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.status === 'completed' ? styles.statusTextSuccess : styles.statusTextError
                      ]}>
                        {item.status === 'completed' ? '翻譯完成' : '翻譯失敗'}
                      </Text>
                    </View>
                    <Text style={styles.fileSize}>{item.fileSize}</Text>
                  </View>

                  {item.status === 'completed' && (
                    <View style={styles.translatedInfo}>
                      <Text style={styles.translatedLabel}>翻譯文件：</Text>
                      <Text style={styles.translatedFileName}>{item.translatedFileName}</Text>
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
  historyList: {
    gap: 16,
  },
  historyCard: {
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
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusError: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusTextSuccess: {
    color: '#065F46',
  },
  statusTextError: {
    color: '#991B1B',
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  translatedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  translatedLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  translatedFileName: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    flex: 1,
  },
});