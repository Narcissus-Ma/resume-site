import fs from 'fs/promises';
import path from 'path';
import translate from 'google-translate-api';

// 源数据文件路径
const SOURCE_DATA_DIR = path.resolve(process.cwd(), './src/data');
const SOURCE_LANG = 'zh-CN';
const TARGET_LANGS = ['en-US', 'ja-JP'];

// 递归翻译JSON对象
async function translateJson(obj, targetLang) {
  const result = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      try {
        // 翻译字符串值 - 使用备用服务器地址
        const translation = await translate(obj[key], { 
          to: getGoogleLangCode(targetLang),
          host: 'translate.google.cn'  // 使用Google中国镜像
        });
        result[key] = translation.text;
        console.log(`翻译: ${obj[key]} -> ${result[key]}`);
      } catch (error) {
        console.error(`翻译失败: ${obj[key]}`, error.message);
        result[key] = obj[key]; // 翻译失败时保持原文
      }
      // 添加延迟以避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 300));
    } else if (Array.isArray(obj[key])) {
      result[key] = [];
      for (const item of obj[key]) {
        if (typeof item === 'string') {
          try {
            const translation = await translate(item, { 
              to: getGoogleLangCode(targetLang),
              host: 'translate.google.cn'  // 使用Google中国镜像
            });
            result[key].push(translation.text);
            console.log(`翻译: ${item} -> ${result[key][result[key].length - 1]}`);
          } catch (error) {
            console.error(`翻译失败: ${item}`, error.message);
            result[key].push(item); // 翻译失败时保持原文
          }
          // 添加延迟以避免请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (typeof item === 'object' && item !== null) {
          result[key].push(await translateJson(item, targetLang));
        } else {
          result[key].push(item);
        }
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = await translateJson(obj[key], targetLang);
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
}

// 获取Google翻译API的语言代码
function getGoogleLangCode(lang) {
  const langMap = {
    'en-US': 'en',
    'ja-JP': 'ja',
    'zh-CN': 'zh'
  };
  return langMap[lang] || lang;
}

// 翻译单个数据文件
async function translateDataFile(filename, targetLang) {
  const sourcePath = path.join(SOURCE_DATA_DIR, `${filename}_${SOURCE_LANG}.json`);
  const targetPath = path.join(SOURCE_DATA_DIR, `${filename}_${targetLang}.json`);
  
  console.log(`正在翻译文件: ${sourcePath} -> ${targetPath}`);
  
  try {
    // 读取源文件
    const sourceData = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
    
    // 翻译数据
    const translatedData = await translateJson(sourceData, targetLang);
    
    // 写入目标文件
    await fs.writeFile(targetPath, JSON.stringify(translatedData, null, 2), 'utf8');
    
    console.log(`翻译完成: ${targetPath}`);
  } catch (error) {
    console.error(`处理文件失败: ${sourcePath}`, error);
  }
}

// 翻译所有数据文件
async function translateAllData() {
  try {
    // 获取所有源数据文件
    const files = await fs.readdir(SOURCE_DATA_DIR);
    const sourceFiles = files
      .filter(file => file.endsWith(`_${SOURCE_LANG}.json`))
      .map(file => file.replace(`_${SOURCE_LANG}.json`, ''));
    
    console.log(`找到源数据文件: ${sourceFiles.join(', ')}`);
    
    for (const file of sourceFiles) {
      for (const lang of TARGET_LANGS) {
        await translateDataFile(file, lang);
      }
    }
    
    console.log('所有文件翻译完成！');
  } catch (error) {
    console.error('翻译过程出错:', error);
  }
}

// 执行翻译
await translateAllData();

export { translateJson, translateDataFile, translateAllData };