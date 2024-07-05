import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// 定义API函数
const apiFunctions = [
  {
    apiPath: 'inventory/list',
    fnName: 'getInventoryList',
    fnDescription: '获取库存列表',
  },
  {
    apiPath: 'inventory/history',
    fnName: 'getInventoryHistory',
    fnDescription: '獲取庫存變動歷史',
  },
  {
    apiPath: 'inventory/in',
    fnName: 'setInventoryIn',
    fnDescription: '产品入库',
    successMessage: '設定成功',
  },
  {
    apiPath: 'inventory/out',
    fnName: 'setInventoryOut',
    fnDescription: '产品出库',
    successMessage: '設定成功',
  },
  {
    apiPath: 'inventory/low-stock-alert',
    fnName: 'setInventoryLowAlert',
    fnDescription: '获取低库存预警',
  },
  {
    apiPath: 'inventory/high-stock-alert',
    fnName: 'setInventoryHighAlert',
    fnDescription: '获取高库存预警',
  },
  // 可以添加更多API函数
];

const addFunction = ({ apiPath, fnName, fnDescription, successMessage }) => {
  return new Promise((resolve, reject) => {
    const command = `npm run api -- ${apiPath} ${fnName} "${fnDescription}" "${
      successMessage || ''
    }"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}\n${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error output: ${stderr}`);
        reject(stderr);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
};

const processBatch = async () => {
  for (const apiFunction of apiFunctions) {
    await addFunction(apiFunction);
  }
  console.log('All functions added successfully.');
};

processBatch();
