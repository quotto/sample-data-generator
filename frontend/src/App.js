import React from 'react';
import TestDataForm from './TestDataForm';
import { Container } from '@mui/material';

const App = () => {
    return (
        <Container maxWidth="lg">
            <h1>テストデータ作成フォーム</h1>
            <TestDataForm />
        </Container>
    );
};

export default App;
