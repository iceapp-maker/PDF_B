// src/utils/svgPdfGenerator.ts
export class SVGPdfGenerator {
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
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG 翻譯文檔 - ${this.escapeHtml(originalFileName)}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Microsoft YaHei', sans-serif;
            background: #f5f5f5;
        }
        .page-container {
            max-width: ${pageWidth}px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .svg-page {
            width: 100%;
            height: auto;
            display: block;
        }
        .header {
            text-align: center;
            padding: 20px;
            background: #007acc;
            color: white;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { margin: 0; padding: 0; background: white; }
            .page-container { box-shadow: none; max-width: none; }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="header">
            <h1>PDF 翻譯文檔</h1>
            <p>原始文件：${this.escapeHtml(originalFileName)}</p>
            <p>翻譯時間：${new Date().toLocaleString('zh-TW')}</p>
        </div>
        
        ${svgContent}
        
        <div class="footer">
            <p>此文檔由 PDF 翻譯工具生成 | 生成時間：${new Date().toISOString()}</p>
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
    const lineHeight = 24;
    const marginX = 50;
    const marginY = 50;
    const maxWidth = pageWidth - (marginX * 2);
    
    let svgElements: string[] = [];
    let currentY = marginY;
    
    // 背景
    svgElements.push(`
      <rect x="0" y="0" width="${pageWidth}" height="${pageHeight}" 
            fill="white" stroke="#ddd" stroke-width="1"/>
    `);
    
    // 處理每一行文字
    lines.forEach((line, index) => {
      if (currentY > pageHeight - marginY) {
        // 如果超出頁面，可以在這裡處理分頁
        return;
      }
      
      // 判斷是否為標題（簡單規則）
      const isTitle = line.match(/^\d+\./);
      const fontSize = isTitle ? 18 : 14;
      const fontWeight = isTitle ? 'bold' : 'normal';
      
      // 處理長文字自動換行
      const wrappedLines = this.wrapText(line, maxWidth, fontSize);
      
      wrappedLines.forEach(wrappedLine => {
        svgElements.push(`
          <text x="${marginX}" y="${currentY}" 
                font-family="Microsoft YaHei, sans-serif" 
                font-size="${fontSize}" 
                font-weight="${fontWeight}"
                fill="#333"
                xml:space="preserve">${this.escapeXml(wrappedLine)}</text>
        `);
        currentY += lineHeight;
      });
      
      // 標題後增加額外間距
      if (isTitle) {
        currentY += 10;
      }
    });
    
    return `
      <svg class="svg-page" width="${pageWidth}" height="${pageHeight}" 
           viewBox="0 0 ${pageWidth} ${pageHeight}" 
           xmlns="http://www.w3.org/2000/svg">
        ${svgElements.join('')}
      </svg>
    `;
  }

  /**
   * 文字自動換行
   */
  private static wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    // 簡化的文字換行邏輯
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
    const lines: string[] = [];
    
    for (let i = 0; i < text.length; i += charsPerLine) {
      lines.push(text.slice(i, i + charsPerLine));
    }
    
    return lines.length > 0 ? lines : [text];
  }

  /**
   * XML 轉義
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * HTML 轉義
   */
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}