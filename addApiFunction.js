import fs from 'fs';
import path from 'path';
import readline from 'readline';

const args = process.argv.slice(2);
const [apiPath, fnName, fnDescription, successMessage] = args;

// 从路径中提取文件名
const segments = apiPath.split('/');
const fileName = segments[0] + '.ts'; // 使用第一个斜线前的部分作为文件名
// 构造文件路径
const filePath = path.join(process.cwd(), 'src/store/api', fileName);

// 函数模板
const functionTemplate = (fnName, fnDescription, apiPath, successMessage) => `
  //===================${fnDescription}==================//
  async ${fnName}({ commit }, payload) {
    const res = await axios.post('/api/${apiPath}', payload);
    if (!res.error) {
      ${successMessage ? `message.success('${successMessage}');` : ''}
      return res.ret.data;
    } else {
      message.error(res.msg);
      return false;
    }
  },
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askUser = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase());
    });
  });
};

const processFile = async () => {
  if (!fs.existsSync(filePath)) {
    // 如果文件不存在，创建文件并添加默认内容
    const defaultContent = `
import axios from '@/utils/axios';
import { message } from 'ant-design-vue';
export default {
}
    `;
    fs.writeFileSync(filePath, defaultContent, 'utf8');
  }

  // 读取文件内容
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // 检查函数名和API路径是否已经存在
  const fnNameExists = new RegExp(`async ${fnName}\\s*\\(`).test(fileContent);
  const apiPathExists = new RegExp(`axios\\.post\\('/api/${apiPath}'`).test(
    fileContent
  );

  if (fnNameExists || apiPathExists) {
    const question = `${fnNameExists ? '函数名称已存在' : ''}${
      fnNameExists && apiPathExists ? '，且' : ''
    }${apiPathExists ? 'API路径已存在' : ''}。是否要继续？ (y/n) `;
    const answer = await askUser(question);

    if (answer !== 'y' && answer !== 'yes') {
      console.log('操作已取消');
      rl.close();
      return;
    }
  }

  // 查找插入点（在文件末尾之前插入）
  const insertPoint =
    fileContent.lastIndexOf('export default {') + 'export default {'.length;
  const endPoint = fileContent.lastIndexOf('}');

  // 插入函数
  const updatedContent =
    fileContent.slice(0, endPoint) +
    functionTemplate(fnName, fnDescription, apiPath, successMessage) +
    fileContent.slice(endPoint);

  // 写回文件
  fs.writeFileSync(filePath, updatedContent, 'utf8');

  console.log(`Function ${fnName} added to ${filePath}`);

  // 更新 src/store/index.ts
  const storeIndexPath = path.join(process.cwd(), 'src/store/index.ts');
  let storeIndexContent = fs.readFileSync(storeIndexPath, 'utf8');

  // 检查是否已导入该模块
  const importStatement = `import ${segments[0]} from './api/${segments[0]}';\n`;
  if (!storeIndexContent.includes(importStatement)) {
    // 添加 import 语句
    const importInsertPoint =
      storeIndexContent.indexOf('import ') + 'import '.length;
    storeIndexContent =
      storeIndexContent.slice(0, importInsertPoint) +
      importStatement +
      storeIndexContent.slice(importInsertPoint);
  }

  // 添加到 actions 中
  const actionsInsertPoint =
    storeIndexContent.lastIndexOf('actions: {') + 'actions: {'.length;
  if (!storeIndexContent.includes(`...${segments[0]},`)) {
    storeIndexContent =
      storeIndexContent.slice(0, actionsInsertPoint) +
      `\n    ...${segments[0]},` +
      storeIndexContent.slice(actionsInsertPoint);
  }

  // 写回文件
  fs.writeFileSync(storeIndexPath, storeIndexContent, 'utf8');
  console.log(`Updated store index: ${storeIndexPath}`);

  rl.close();
};

processFile();
