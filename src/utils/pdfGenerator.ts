// utils/pdfGenerator.ts
// 簡化版PDF生成器，專為網頁環境設計

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
   * 創建HTML格式的翻譯文檔
   */
  static async createTranslatedPDF(originalFileName: string, translatedContent: string): Promise<Blob> {
    try {
      console.log('開始生成文檔...', originalFileName);
      
      // 創建HTML內容
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>翻譯文檔 - ${originalFileName}</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
            margin: 40px;
            line-height: 1.8;
            color: #333;
            background: #fff;
        }
        .header {
            border-bottom: 3px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #007acc;
            margin-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .content {
            white-space: pre-wrap;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
            text-align: center;
        }
        @media print {
            body { margin: 20px; }
            .no-print { display: none; }
        }
        @page {
            margin: 2cm;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">PDF 翻譯文檔</div>
        <div class="meta">原始文件：${originalFileName}</div>
        <div class="meta">翻譯時間：${new Date().toLocaleString('zh-TW')}</div>
        <div class="meta">文檔狀態：翻譯完成</div>
    </div>
    
    <div class="content">${this.escapeHtml(translatedContent)}</div>
    
    <div class="footer">
        <p>此文檔由PDF翻譯工具自動生成</p>
        <p>生成時間：${new Date().toISOString()}</p>
        <p class="no-print">提示：您可以使用瀏覽器的「列印」功能將此頁面儲存為PDF</p>
    </div>
</body>
</html>`;

      // 將HTML轉換為Blob
      const blob = new Blob([htmlContent], { 
        type: 'text/html;charset=utf-8' 
      });
      
      console.log('文檔生成完成，大小：', blob.size, 'bytes');
      return blob;
      
    } catch (error) {
      console.error('文檔生成錯誤：', error);
      throw new Error(`文檔生成失敗：${error.message}`);
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
   * 安全下載文件
   */
  static async downloadPDF(blob: Blob, fileName: string): Promise<boolean> {
    try {
      console.log('開始下載文件...', fileName);
      
      // 確保文件名有正確的擴展名
      const downloadFileName = fileName.endsWith('.html') ? fileName : fileName.replace(/\.[^/.]+$/, '') + '.html';

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
}