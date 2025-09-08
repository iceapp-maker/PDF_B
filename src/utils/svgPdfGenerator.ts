// src/utils/svgPdfGenerator.ts
export class SVGPdfGenerator {
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
   * 生成 SVG 格式的翻譯文檔
   */
  static async createSVGTranslatedPDF(
    originalFileName: string, 
    translatedContent: string,
    pageWidth: number = 595,
    pageHeight: number = 842
  ): Promise<Blob> {
    try {
      console.log('開始生成 SVG 文檔...', originalFileName);
      
      // 將翻譯內容分段處理
      const lines = translatedContent.split('\n').filter(line => line.trim());
      
      // 生成 SVG 內容
      const svgContent = this.generateSVGContent(lines, pageWidth, pageHeight);
      
      // 創建包含 SVG 的 HTML
      const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG 翻譯文檔 - ${this.escapeHtml(originalFileName)}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .page-container {
            max-width: ${pageWidth}px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .svg-page {
            width: 100%;
            height: auto;
            display: block;
        }
        .header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #007acc, #0056b3);
            color: white;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 700;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
        .svg-container {
            position: relative;
            background: white;
        }
        .format-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #7c3aed;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            z-index: 10;
        }
        @media print {
            body { 
                margin: 0; 
                padding: 0; 
                background: white; 
            }
            .page-container { 
                box-shadow: none; 
                max-width: none; 
                border-radius: 0;
            }
            .no-print { 
                display: none; 
            }
        }
        @page {
            margin: 1cm;
            size: A4;
        }
        /* SVG 特定樣式 */
        .svg-text {
            font-family: 'Microsoft YaHei', sans-serif;
            fill: #333;
        }
        .svg-title {
            font-weight: bold;
            fill: #007acc;
        }
        .svg-background {
            fill: white;
            stroke: #e5e7eb;
            stroke-width: 1;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="header">
            <h1>PDF 翻譯文檔 (SVG格式)</h1>
            <p>原始文件：${this.escapeHtml(originalFileName)}</p>
            <p>翻譯時間：${new Date().toLocaleString('zh-TW')}</p>
            <p>格式：向量圖形 (SVG) - 保持版面佈局</p>
        </div>
        
        <div class="svg-container">
            <div class="format-badge">SVG</div>
            ${svgContent}
        </div>
        
        <div class="footer">
            <p><strong>此文檔由 PDF 翻譯工具生成 (SVG格式)</strong></p>
            <p>生成時間：${new Date().toISOString()}</p>
            <p class="no-print">💡 提示：SVG格式保持了原始版面佈局，可無損縮放</p>
            <p class="no-print">🖨️ 您可以使用瀏覽器的「列印」功能將此頁面儲存為PDF</p>
        </div>
    </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { 
        type: 'text/html;charset=utf-8' 
      });
      
      console.log('SVG 文檔生成完成，大小：', blob.size, 'bytes');
      return blob;
      
    } catch (error) {
      console.error('SVG 文檔生成錯誤：', error);
      throw new Error(`SVG 文檔生成失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 生成 SVG 內容
   */
  private static generateSVGContent(
    lines: string[], 
    pageWidth: number, 
    pageHeight: number
  ): string {
    const lineHeight = 28;
    const marginX = 60;
    const marginY = 60;
    const maxWidth = pageWidth - (marginX * 2);
    
    let svgElements: string[] = [];
    let currentY = marginY;
    
    // 計算所需高度
    let totalHeight = Math.max(pageHeight, lines.length * lineHeight + marginY * 2);
    
    // 背景矩形
    svgElements.push(`
      <rect x="0" y="0" width="${pageWidth}" height="${totalHeight}" 
            class="svg-background"/>
    `);
    
    // 添加裝飾性邊框
    svgElements.push(`
      <rect x="20" y="20" width="${pageWidth - 40}" height="${totalHeight - 40}" 
            fill="none" stroke="#007acc" stroke-width="2" stroke-dasharray="5,5" opacity="0.3"/>
    `);
    
    // 處理每一行文字
    lines.forEach((line, index) => {
      if (currentY > totalHeight - marginY) {
        // 如果超出頁面，擴展高度
        totalHeight += lineHeight * 10;
      }
      
      // 判斷文字類型
      const isTitle = line.match(/^\d+\.\s/) || line.startsWith('翻譯文檔：');
      const isSubheading = line.match(/^[一二三四五六七八九十]+\.\s/) || line.match(/^[A-Z]\.\s/);
      const isBulletPoint = line.match(/^\s*-\s/);
      const isImportant = line.includes('注意事項') || line.includes('重要') || line.includes('警告');
      
      // 設定樣式
      let fontSize = 16;
      let fontWeight = 'normal';
      let fillColor = '#333';
      let additionalClass = 'svg-text';
      
      if (isTitle) {
        fontSize = 22;
        fontWeight = 'bold';
        fillColor = '#007acc';
        additionalClass = 'svg-title';
      } else if (isSubheading) {
        fontSize = 18;
        fontWeight = 'bold';
        fillColor = '#0056b3';
      } else if (isImportant) {
        fontSize = 16;
        fontWeight = 'bold';
        fillColor = '#dc3545';
      } else if (isBulletPoint) {
        fontSize = 14;
        fillColor = '#495057';
      }
      
      // 處理長文字自動換行
      const wrappedLines = this.wrapText(line, maxWidth, fontSize);
      
      wrappedLines.forEach((wrappedLine, lineIndex) => {
        // 為標題添加背景
        if (isTitle && lineIndex === 0) {
          svgElements.push(`
            <rect x="${marginX - 10}" y="${currentY - fontSize}" 
                  width="${Math.min(wrappedLine.length * fontSize * 0.6 + 20, maxWidth)}" 
                  height="${fontSize + 8}" 
                  fill="#e3f2fd" stroke="#007acc" stroke-width="1" rx="4"/>
          `);
        }
        
        // 為重要內容添加圖標
        if (isImportant && lineIndex === 0) {
          svgElements.push(`
            <circle cx="${marginX - 20}" cy="${currentY - fontSize/2}" r="8" fill="#ffc107"/>
            <text x="${marginX - 20}" y="${currentY - fontSize/2 + 3}" 
                  text-anchor="middle" font-size="12" font-weight="bold" fill="#212529">!</text>
          `);
        }
        
        // 為項目符號添加圓點
        if (isBulletPoint && lineIndex === 0) {
          svgElements.push(`
            <circle cx="${marginX - 15}" cy="${currentY - fontSize/2}" r="3" fill="#6c757d"/>
          `);
        }
        
        // 添加文字
        svgElements.push(`
          <text x="${marginX}" y="${currentY}" 
                font-family="Microsoft YaHei, PingFang SC, sans-serif" 
                font-size="${fontSize}" 
                font-weight="${fontWeight}"
                fill="${fillColor}"
                class="${additionalClass}"
                xml:space="preserve">${this.escapeXml(wrappedLine)}</text>
        `);
        
        currentY += lineHeight;
      });
      
      // 為不同類型的內容添加額外間距
      if (isTitle) {
        currentY += 15;
        // 添加分隔線
        svgElements.push(`
          <line x1="${marginX}" y1="${currentY - 10}" 
                x2="${pageWidth - marginX}" y2="${currentY - 10}" 
                stroke="#007acc" stroke-width="2"/>
        `);
      } else if (isSubheading) {
        currentY += 10;
      } else if (line.trim() === '') {
        currentY += 5;
      }
    });
    
    // 更新總高度
    totalHeight = Math.max(totalHeight, currentY + marginY);
    
    // 添加頁腳裝飾
    svgElements.push(`
      <line x1="50" y1="${totalHeight - 30}" 
            x2="${pageWidth - 50}" y2="${totalHeight - 30}" 
            stroke="#dee2e6" stroke-width="1"/>
    `);
    
    // 添加頁碼（模擬）
    svgElements.push(`
      <text x="${pageWidth - 50}" y="${totalHeight - 10}" 
            font-family="Arial, sans-serif" 
            font-size="12" 
            fill="#6c757d" 
            text-anchor="end">第 1 頁</text>
    `);
    
    return `
      <svg class="svg-page" width="${pageWidth}" height="${totalHeight}" 
           viewBox="0 0 ${pageWidth} ${totalHeight}" 
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="0" y="0" width="120%" height="120%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.1"/>
          </filter>
        </defs>
        ${svgElements.join('')}
      </svg>
    `;
  }

  /**
   * 智能文字自動換行
   */
  private static wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    if (!text || text.trim() === '') {
      return [''];
    }
    
    // 估算字符寬度（中文字符較寬）
    const estimateCharWidth = (char: string): number => {
      // 中文字符
      if (char.match(/[\u4e00-\u9fff]/)) {
        return fontSize * 0.9;
      }
      // 英文字符
      if (char.match(/[a-zA-Z]/)) {
        return fontSize * 0.6;
      }
      // 數字
      if (char.match(/[0-9]/)) {
        return fontSize * 0.7;
      }
      // 標點符號
      return fontSize * 0.5;
    };
    
    const lines: string[] = [];
    const words = text.split('');
    let currentLine = '';
    let currentWidth = 0;
    
    for (const char of words) {
      const charWidth = estimateCharWidth(char);
      
      if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
        currentWidth = charWidth;
      } else {
        currentLine += char;
        currentWidth += charWidth;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text];
  }

  /**
   * XML 字符轉義
   */
  private static escapeXml(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 移除控制字符
  }

  /**
   * HTML 字符轉義
   */
  private static escapeHtml(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 驗證生成的 SVG 內容
   */
  private static validateSVGContent(svgContent: string): boolean {
    try {
      // 基本 SVG 結構檢查
      if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        console.error('SVG 內容缺少基本結構');
        return false;
      }
      
      // 檢查是否包含文字內容
      if (!svgContent.includes('<text')) {
        console.warn('SVG 內容缺少文字元素');
      }
      
      return true;
    } catch (error) {
      console.error('SVG 內容驗證失敗：', error);
      return false;
    }
  }

  /**
   * 獲取 SVG 統計信息
   */
  static getSVGStats(content: string): object {
    const lines = content.split('\n').filter(line => line.trim());
    const textElements = (content.match(/<text/g) || []).length;
    const totalChars = content.length;
    
    return {
      totalLines: lines.length,
      textElements: textElements,
      totalCharacters: totalChars,
      estimatedSize: `${Math.round(totalChars / 1024)} KB`,
      generatedAt: new Date().toISOString()
    };
  }
}