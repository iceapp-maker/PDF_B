// utils/pdfGenerator.ts
// React Native/Expo 兼容版本 - 不依賴 jsPDF

export class PDFGenerator {
  /**
   * 模擬翻譯內容生成
   */
  static async simulateTranslation(fileName: string): Promise<string> {
    // 模擬翻譯延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `翻譯文檔：${fileName}

本文檔已成功翻譯為中文版本。

主要內容：

1. 文檔概述
   這是一份經過專業翻譯的PDF文檔，保持了原始格式和內容結構。
   翻譯過程採用了先進的語言處理技術，確保翻譯的準確性和流暢性。

2. 技術規格
   - 文檔格式：PDF
   - 翻譯語言：中文
   - 處理時間：${new Date().toLocaleString('zh-TW')}
   - 文件狀態：翻譯完成

3. 內容摘要
   本文檔包含了重要的信息和數據，經過仔細的翻譯處理，
   確保所有專業術語和概念都能準確地以中文表達。

4. 使用說明
   請妥善保存此翻譯版本，如有任何疑問或需要進一步的
   翻譯服務，請聯繫相關技術支持團隊。

注意事項：
- 本翻譯僅供參考使用
- 如需正式文檔請聯繫專業翻譯服務
- 請確保文檔使用符合相關法規要求

翻譯完成時間：${new Date().toISOString()}
原始檔案：${fileName}`;
  }

  /**
   * 創建簡單的PDF內容（使用HTML模擬）
   */
  static async createTranslatedPDF(originalFileName: string, translatedContent: string): Promise<Blob> {
    try {
      console.log('開始生成PDF...', originalFileName);
      
      // 創建HTML內容來模擬PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>翻譯文檔 - ${originalFileName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #007acc;
            margin-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 14px;
        }
        .content {
            white-space: pre-wrap;
            font-size: 16px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">翻譯文檔</div>
        <div class="meta">
            原始文件：${originalFileName}<br>
            翻譯時間：${new Date().toLocaleString('zh-TW')}<br>
            文檔狀態：翻譯完成
        </div>
    </div>
    
    <div class="content">${this.escapeHtml(translatedContent)}</div>
    
    <div class="footer">
        此文檔由PDF翻譯工具自動生成 | 生成時間：${new Date().toISOString()}
    </div>
</body>
</html>`;

      // 將HTML轉換為Blob (模擬PDF)
      const blob = new Blob([htmlContent], { 
        type: 'text/html;charset=utf-8' 
      });
      
      console.log('PDF生成完成，大小：', blob.size, 'bytes');
      return blob;
      
    } catch (error) {
      console.error('PDF生成錯誤：', error);
      throw new Error(`PDF生成失敗：${error.message}`);
    }
  }

  /**
   * 轉義HTML字符
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  /**
   * 驗證文件的有效性
   */
  static async validatePDF(blob: Blob): Promise<boolean> {
    try {
      if (!blob || blob.size === 0) {
        console.error('文件驗證失敗：文件為空');
        return false;
      }

      console.log('文件驗證成功，大小：', blob.size, 'bytes');
      return true;
    } catch (error) {
      console.error('文件驗證失敗：', error);
      return false;
    }
  }

  /**
   * 安全下載文件
   */
  static async downloadPDF(blob: Blob, fileName: string): Promise<boolean> {
    try {
      console.log('開始下載文件...', fileName);
      
      // 先驗證文件有效性
      const isValid = await this.validatePDF(blob);
      if (!isValid) {
        throw new Error('文件格式無效');
      }

      // 為HTML文件設置正確的文件名
      const downloadFileName = fileName.replace('.pdf', '.html');

      // 創建下載鏈接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      
      // 設置下載屬性
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // 觸發下載
      link.click();
      
      // 清理
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log('文件下載完成');
      return true;
    } catch (error) {
      console.error('文件下載失敗：', error);
      return false;
    }
  }

  /**
   * 創建實際的PDF文件 (需要瀏覽器支持)
   */
  static async createRealPDF(originalFileName: string, translatedContent: string): Promise<Blob> {
    try {
      // 檢查瀏覽器是否支持 PDF API
      if (typeof window === 'undefined' || !window.print) {
        throw new Error('瀏覽器不支持PDF生成');
      }

      // 創建HTML內容
      const htmlBlob = await this.createTranslatedPDF(originalFileName, translatedContent);
      const htmlText = await htmlBlob.text();

      // 創建臨時窗口並打印為PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('無法創建打印窗口');
      }

      printWindow.document.write(htmlText);
      printWindow.document.close();
      
      // 提示用戶手動保存為PDF
      alert('請使用瀏覽器的 "打印" 功能，選擇 "另存為PDF" 來保存文件');
      
      return htmlBlob;
    } catch (error) {
      console.error('PDF創建失敗，將返回HTML格式：', error);
      return await this.createTranslatedPDF(originalFileName, translatedContent);
    }
  }
}

// 調試工具類
export class PDFDebugger {
  
  /**
   * 測試基本文件生成功能
   */
  static async testBasicPDFGeneration(): Promise<void> {
    console.log('🔍 開始文件生成測試...');
    
    try {
      const testContent = `測試內容
這是一個測試文檔。
包含多行文字內容。`;
      
      const blob = await PDFGenerator.createTranslatedPDF('test.pdf', testContent);
      
      console.log('✅ 文件生成成功');
      console.log('📊 文件大小:', blob.size, 'bytes');
      console.log('📋 文件類型:', blob.type);
      
      const isValid = await PDFGenerator.validatePDF(blob);
      console.log('📋 文件驗證:', isValid ? '✅ 有效' : '❌ 無效');
      
    } catch (error) {
      console.error('❌ 文件生成測試失敗:', error);
    }
  }

  /**
   * 檢查環境兼容性
   */
  static checkEnvironmentCompatibility(): void {
    console.log('🌐 檢查環境兼容性...');
    
    const features = [
      { name: 'Blob', supported: typeof Blob !== 'undefined' },
      { name: 'URL.createObjectURL', supported: typeof URL?.createObjectURL === 'function' },
      { name: 'document', supported: typeof document !== 'undefined' },
      { name: 'window', supported: typeof window !== 'undefined' },
    ];
    
    features.forEach(feature => {
      console.log(`- ${feature.name}:`, feature.supported ? '✅ 支持' : '❌ 不支持');
    });
  }
}