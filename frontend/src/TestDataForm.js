import React, { useState, useRef } from 'react';
import { Button, CircularProgress, Grid, MenuItem, TextField, Checkbox, Table, TableBody, TableRow, TableCell, TableHead, Paper, TableContainer, IconButton } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Auth from '@aws-amplify/auth';

import './App.css';
import * as axios from 'axios';

const TestDataForm = () => {
  const inputRef = useRef(null);
  const [outputFormat, setOutputFormat] = useState('csv');
  const [outputCount, setOutputCount] = useState(1);
  const [dataItems, setDataItems] = useState([{ name: '', type: 'string', maxLength: 1, unique: false, description: '', sample: '', variableLength: true }]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleExport = () => {
    const data = JSON.stringify(dataItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-data-config.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const importedData = JSON.parse(e.target.result);
      setDataItems(importedData);
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      outputFormat: outputFormat,
      outputCount: outputCount,
      dataItems: dataItems,
    };

    try {
      setLoading(true);
      // Amplifyモジュールを使ってBearerトークンにCogitoのアクセストークンを設定する
      const response = await axios.post(process.env.REACT_APP_API_URL, requestData,
        {headers: {
          Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
          'Content-Type': 'application/json'
        }});

      // const response = await axios.post(process.env.REACT_APP_API_URL, requestData, {heders: {'Content-Type': 'application/json'}});
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
        <Grid item xs={12}>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>項目名</TableCell>
            <TableCell>データ型</TableCell>
            <TableCell>最大データ長</TableCell>
            <TableCell>ユニーク</TableCell>
            <TableCell>可変長</TableCell>
            <TableCell>詳細</TableCell>
            <TableCell>サンプルデータ</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataItems.map((item, index) => (
            <TableRow key={index}
              style={{
                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
              <TableCell>
                <TextField
                  value={item.name}
                  onChange={(e) => handleDataItemChange(index, 'name', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  select
                  value={item.type}
                  onChange={(e) => handleDataItemChange(index, 'type', e.target.value)}
                >
                  <MenuItem value="string">文字列</MenuItem>
                  <MenuItem value="integer">整数</MenuItem>
                  <MenuItem value="float">小数</MenuItem>
                  <MenuItem value="image">画像</MenuItem>
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={item.maxLength}
                  onChange={(e) => handleDataItemChange(index, 'maxLength', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={item.unique}
                  onChange={(e) => handleDataItemChange(index, 'unique', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={item.variableLength}
                  onChange={(e) => handleDataItemChange(index, 'variableLength', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={item.description}
                  onChange={(e) => handleDataItemChange(index, 'description', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={item.sample}
                  onChange={(e) => handleDataItemChange(index, 'sample', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <IconButton color="secondary" onClick={() => removeDataItem(index)}>
                  <DeleteForeverIcon color='error'/>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={8}>
              <Button variant="outlined" color="primary" onClick={addDataItem}>
               追加
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
        </Grid>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button variant="contained" color="success" onClick={handleSubmit}>
                作成
              </Button>
            </Grid>
        </>
          )}
          {!loading && downloadUrl && (
            <Grid item xs={12} display="flex"  justifyContent="center">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                テストデータをダウンロード
              </a>
            </Grid>
          )}
          <Grid container item xs={12} spacing={2}>
              <Grid item xs={6} display="flex" justifyContent="right">
                <Button variant="contained" onClick={handleExport}>
                  Export
                </Button>
              </Grid>
              <Grid item xs={6} display="flex" justifyContent="left">
                <Button variant="outlined" onClick={() => inputRef.current.click()}>
                  Import
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  ref={inputRef}
                  style={{ display: 'none' }}
                />
              </Grid>
              <Grid item xs={5} />
          </Grid>
    </Grid>
  );
}

export default TestDataForm;
