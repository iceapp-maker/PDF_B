import jsPDF from 'jspdf';

export interface TranslatedContent {
  originalText: string;
  translatedText: string;
  page: number;
  position: { x: number; y: number };
}

export class PDFGenerator {
  static async createTranslatedPDF(
    originalFileName: string,
    translatedContent: TranslatedContent[]
  ): Promise<Blob> {
    const pdf = new jsPDF();
    
    // 設置中文字體支持
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    
    let currentPage = 1;
    
    // 添加標題頁
    pdf.text('翻譯文檔', 20, 20);
    pdf.setFontSize(10);
    pdf.text(`原文件名: ${originalFileName}`, 20, 35);
    pdf.text(`翻譯時間: ${new Date().toLocaleString('zh-TW')}`, 20, 45);
    pdf.text('翻譯語言: 中文', 20, 55);
    
    // 添加分隔線
    pdf.line(20, 65, 190, 65);
    
    let yPosition = 80;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 8;
    
    // 添加翻譯內容
    translatedContent.forEach((content, index) => {
      // 檢查是否需要新頁面
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
        currentPage++;
      }
      
      // 添加原文
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`原文 ${index + 1}:`, margin, yPosition);
      yPosition += lineHeight;
      
      // 分行顯示原文
      const originalLines = pdf.splitTextToSize(content.originalText, 170);
      pdf.text(originalLines, margin, yPosition);
      yPosition += originalLines.length * lineHeight + 5;
      
      // 添加譯文
      pdf.setTextColor(0, 0, 0);
      pdf.text(`譯文 ${index + 1}:`, margin, yPosition);
      yPosition += lineHeight;
      
      // 分行顯示譯文
      const translatedLines = pdf.splitTextToSize(content.translatedText, 170);
      pdf.text(translatedLines, margin, yPosition);
      yPosition += translatedLines.length * lineHeight + 10;
      
      // 添加分隔線
      if (index < translatedContent.length - 1) {
        pdf.line(margin, yPosition, 190, yPosition);
        yPosition += 10;
      }
    });
    
    // 返回PDF Blob
    return new Promise((resolve) => {
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
    });
  }
  
  static async simulateTranslation(fileName: string): Promise<TranslatedContent[]> {
    // 模擬翻譯內容
    const sampleContent: TranslatedContent[] = [
      {
        originalText: "Business Plan Executive Summary",
        translatedText: "商業計劃執行摘要",
        page: 1,
        position: { x: 50, y: 100 }
      },
      {
        originalText: "Our company aims to provide innovative solutions in the technology sector.",
        translatedText: "我們公司致力於在技術領域提供創新解決方案。",
        page: 1,
        position: { x: 50, y: 120 }
      },
      {
        originalText: "Market Analysis shows significant growth potential in our target demographic.",
        translatedText: "市場分析顯示我們目標人群具有顯著的增長潛力。",
        page: 1,
        position: { x: 50, y: 140 }
      },
      {
        originalText: "Financial projections indicate profitability within 18 months.",
        translatedText: "財務預測顯示將在18個月內實現盈利。",
        page: 1,
        position: { x: 50, y: 160 }
      },
      {
        originalText: "Our team consists of experienced professionals with proven track records.",
        translatedText: "我們的團隊由具有良好業績記錄的經驗豐富的專業人士組成。",
        page: 1,
        position: { x: 50, y: 180 }
      }
    ];
    
    return sampleContent;
  }
}