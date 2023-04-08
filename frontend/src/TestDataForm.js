import React, { useState } from 'react';
import { Button, CircularProgress, Grid, MenuItem, TextField, Checkbox, FormControlLabel } from '@mui/material';

import logo from './logo.svg';
import './App.css';
import * as axios from 'axios';

const TestDataForm = () => {
  const [outputFormat, setOutputFormat] = useState('csv');
  const [outputCount, setOutputCount] = useState(1);
  const [dataItems, setDataItems] = useState([{ name: '', type: 'string', maxLength: 1, unique: false, description: '', sample: '', variableLength: true }]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      outputFormat: outputFormat,
      outputCount: outputCount,
      dataItems: dataItems,
    };

    try {
      setLoading(true);
      // ヘッダーのContent-Typeをapplication/jsonに設定してリクエストを送信する
      const response = await axios.post('https://y1coxflu79.execute-api.ap-northeast-1.amazonaws.com/default/sample-data-generator', requestData, {heders: {'Content-Type': 'application/json'}});
      setDownloadUrl(response.data.url);
    } catch (error) {
      console.error('Error calling API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataItemChange = (index, key, value) => {
    const newDataItems = [...dataItems];
    newDataItems[index][key] = value;
    setDataItems(newDataItems);
  };

  const addDataItem = () => {
    setDataItems([...dataItems, { name: '', type: 'string', maxLength: 1, unique: false, description: '', sample: '', variableLength: true }]);
  };

  const removeDataItem = (index) => {
    const newDataItems = [...dataItems];
    newDataItems.splice(index, 1);
    setDataItems(newDataItems);
  };

  return (
    <Grid container spacing={3}>
      {loading ? (
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
            <TextField
              select
              label="出力フォーマット"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="txt">TXT</MenuItem>
              <MenuItem value="xml">XML</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="number"
              label="出力件数"
              value={outputCount}
              onChange={(e) => setOutputCount(e.target.value)}
              InputProps={{ inputProps: { min: 1, max: 100000 } }}
            />
          </Grid>
          {dataItems.map((item, index) => (
            <Grid container item xs={12} spacing={2} key={index}>
              <Grid item xs={3}>
                <TextField
                  label="項目名"
                  value={item.name}
                  onChange={(e) => handleDataItemChange(index, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  select
                  label="データ型"
                  value={item.type}
                  onChange={(e) => handleDataItemChange(index, 'type', e.target.value)}
                >
                  <MenuItem value="string">文字列</MenuItem>
                  <MenuItem value="integer">整数</MenuItem>
                  <MenuItem value="decimal">小数</MenuItem>
                  <MenuItem value="image">画像</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  type="number"
                  label="最大バイト長"
                  value={item.maxLength}
                  onChange={(e) => handleDataItemChange(index, 'maxLength', e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      type="checkbox"
                      checked={item.unique}
                      onChange={(e) => handleDataItemChange(index, 'unique', e.target.checked)}
                    />
                  }
                  label="ユニーク"
                    />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="説明"
                  value={item.description}
                  onChange={(e) => handleDataItemChange(index, 'description', e.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="サンプル"
                  value={item.sample}
                  onChange={(e) => handleDataItemChange(index, 'sample', e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.variableLength}
                      onChange={(e) => handleDataItemChange(index, 'variableLength', e.target.checked)}
                    />
                  }
                  label="可変バイト長"
                />
              </Grid>
              <Grid item xs={1}>
                <Button onClick={() => removeDataItem(index)}>削除</Button>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" color="primary" onClick={addDataItem}>
              項目を追加
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              作成
            </Button>
          </Grid>
        </>
      )}
      {downloadUrl && (
        <Grid item xs={12}>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            テストデータをダウンロード
          </a>
        </Grid>
      )}
    </Grid>
  );
}

export default TestDataForm;
