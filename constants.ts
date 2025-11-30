import { Source } from './types';

export const SOURCES: Source[] = [
  {
    id: 'techcrunch',
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    category: 'Haber',
    description: 'AI iş dünyası ve girişimler hakkında önemli teknoloji haberleri.'
  },
  {
    id: 'google-blog',
    name: 'Google The Keyword',
    url: 'https://blog.google/technology/ai/',
    category: 'Kurumsal',
    description: 'Google AI cephesinden resmi duyurular ve yenilikler.'
  },
  {
    id: 'mit-news',
    name: 'MIT News',
    url: 'https://news.mit.edu/topic/artificial-intelligence2',
    category: 'Akademik',
    description: 'MIT\'den araştırma atılımları ve bilimsel gelişmeler.'
  },
  {
    id: 'deepmind',
    name: 'Google DeepMind',
    url: 'https://deepmind.google/blog/',
    category: 'Araştırma',
    description: 'AGI ve sinir ağları üzerine derin teknik incelemeler.'
  },
  {
    id: 'openai',
    name: 'OpenAI Haberleri (TR)',
    url: 'https://openai.com/tr-TR/news/',
    category: 'Kurumsal',
    description: 'ChatGPT yaratıcılarından ürün güncellemeleri ve güvenlik araştırmaları.'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog',
    category: 'Açık Kaynak',
    description: 'Topluluk odaklı AI, modeller ve açık kaynak kütüphaneler.'
  },
  {
    id: 'anthropic',
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news',
    category: 'Kurumsal',
    description: 'Claude ve anayasal yapay zeka güvenliği üzerine güncellemeler.'
  },
  {
    id: 'mit-tech-review',
    name: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    category: 'Analiz',
    description: 'AI trendleri üzerine derinlemesine analizler ve makaleler.'
  },
  {
    id: 'superhuman',
    name: 'Superhuman.ai',
    url: 'https://www.superhuman.ai/',
    category: 'Bülten',
    description: 'Üretkenlik ve pratik AI araçları haberleri.'
  },
  {
    id: 'therundown',
    name: 'The Rundown',
    url: 'https://www.therundown.ai/',
    category: 'Bülten',
    description: 'AI ekosistemi hakkında hızlı günlük güncellemeler.'
  }
];

export const N8N_TEMPLATE = `
// Bu kod n8n "Code" düğümü için tasarlanmıştır.
// Taranacak URL'leri içeren bir JSON dizisi döndürür.

const sources = {{SOURCES_JSON}};

// Her bir kaynağı n8n formatına uygun hale getiriyoruz
const results = sources.map(source => {
  return {
    json: {
      url: source.url,
      sourceName: source.name,
      category: source.category,
      // Dosya adı veya ID oluşturmak için yardımcı alan
      fileId: source.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + new Date().toISOString().split('T')[0]
    }
  };
});

return results;
`;

export const CLEANER_CODE = `
// BU KODU "AI AGENT" DÜĞÜMÜNDEN HEMEN ÖNCE BİR "CODE" DÜĞÜMÜNE YAPIŞTIRIN.
// Amacı: İçeriği temizlemek ve token sınırını aşmamak için kırpmaktır.

// Önceki düğümden gelen veri (HTML to Markdown kullanmanızı öneririm)
// Genellikle "data", "content" veya "json" içinde gelir.
const inputContent = $json.content || $json.data || JSON.stringify($json);

// Maksimum karakter sayısı (Yaklaşık 30.000 token için 120.000 karakter güvenlidir)
const MAX_LENGTH = 120000;

let cleanedText = "";

if (typeof inputContent === 'string') {
  cleanedText = inputContent;
} else {
  cleanedText = JSON.stringify(inputContent);
}

// 1. Çoklu boşlukları tek boşluğa indir
cleanedText = cleanedText.replace(/\\s+/g, ' ').trim();

// 2. Uzunluğu kontrol et ve gerekirse kes
if (cleanedText.length > MAX_LENGTH) {
  cleanedText = cleanedText.substring(0, MAX_LENGTH) + "... [İÇERİK KISALTILDI - TOKEN SINIRI]";
}

// AI Agent'ın kullanacağı temiz çıktıyı döndür
return {
  json: {
    ...$json, // Eski verileri koru (url, sourceName vs.)
    cleanedContent: cleanedText // Yeni temizlenmiş içerik
  }
};
`;

export const PARSER_CODE = `
// BU KODU "AI AGENT" DÜĞÜMÜNDEN HEMEN SONRA BİR "CODE" DÜĞÜMÜNE YAPIŞTIRIN.
// Amacı: AI çıktısındaki \`\`\`json gibi markdown işaretlerini temizleyip saf JSON elde etmektir.

// AI Agent'ın çıktısının nerede olduğuna bakın. Genellikle 'output', 'text' veya 'response' alanındadır.
// n8n'de sol taraftaki INPUT panelinden doğru alanı kontrol edebilirsiniz.
const agentOutput = $input.item.json.output || $input.item.json.text || $json.output || "";

let cleanString = agentOutput;

if (typeof cleanString === 'string') {
  // 1. Markdown kod bloklarını temizle (\`\`\`json ... \`\`\`)
  cleanString = cleanString.replace(/\\\`\\\`\\\`json/g, "").replace(/\\\`\\\`\\\`/g, "");
  
  // 2. Baştaki ve sondaki boşlukları sil
  cleanString = cleanString.trim();
}

let parsedData = [];
try {
  // 3. JSON'a çevirmeyi dene
  parsedData = JSON.parse(cleanString);
} catch (error) {
  // Hata olursa en azından hatayı görelim, akış durmasın
  parsedData = { 
    error: "JSON Parse Hatası", 
    rawOutput: agentOutput,
    message: error.message 
  };
}

return {
  json: {
    parsedNews: parsedData
  }
};
`;