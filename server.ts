import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;

// 允许跨域请求
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 根据语言获取简历数据文件路径
const getResumeDataPath = (lang: string = 'zh-CN') => {
  // 默认为中文，其他语言使用对应的语言文件
  const fileName = `resumeData_${lang}.json`;
  return path.join(process.cwd(), "src", "data", fileName);
};

// 根据语言获取主页数据文件路径
const getHomeDataPath = (lang: string = 'zh-CN') => {
  // 默认为中文，其他语言使用对应的语言文件
  const fileName = `homeData_${lang}.json`;
  return path.join(process.cwd(), "src", "data", fileName);
};

// 获取简历数据
app.get("/api/resume", (req, res) => {
  try {
    const lang = req.query.lang as string || 'zh-CN';
    const resumeDataPath = getResumeDataPath(lang);
    const data = fs.readFileSync(resumeDataPath, "utf8");
    const resumeData = JSON.parse(data);
    res.json(resumeData);
  } catch (error) {
    console.error("读取简历数据失败:", error);
    res.status(500).json({ error: "读取简历数据失败" });
  }
});

// 保存简历数据
app.post("/api/resume", (req, res) => {
  try {
    const lang = req.query.lang as string || 'zh-CN';
    const resumeDataPath = getResumeDataPath(lang);
    const resumeData = req.body;
    // 直接写入JSON文件
    fs.writeFileSync(
      resumeDataPath,
      JSON.stringify(resumeData, null, 2),
      "utf8"
    );
    res.json({ success: true, message: "简历数据保存成功" });
  } catch (error) {
    console.error("保存简历数据失败:", error);
    res.status(500).json({ error: "保存简历数据失败" });
  }
});

// 获取主页数据
app.get("/api/home", (req, res) => {
  try {
    const lang = req.query.lang as string || 'zh-CN';
    const homeDataPath = getHomeDataPath(lang);
    const data = fs.readFileSync(homeDataPath, "utf8");
    const homeData = JSON.parse(data);
    res.json(homeData);
  } catch (error) {
    console.error("读取主页数据失败:", error);
    res.status(500).json({ error: "读取主页数据失败" });
  }
});

// 保存主页数据
app.post("/api/home", (req, res) => {
  try {
    const lang = req.query.lang as string || 'zh-CN';
    const homeDataPath = getHomeDataPath(lang);
    const homeData = req.body;
    // 直接写入JSON文件
    fs.writeFileSync(homeDataPath, JSON.stringify(homeData, null, 2), "utf8");
    res.json({ success: true, message: "主页数据保存成功" });
  } catch (error) {
    console.error("保存主页数据失败:", error);
    res.status(500).json({ error: "保存主页数据失败" });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
