import React from 'react';
import TestDataForm from './TestDataForm';
import { Container } from '@mui/material';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const App = () => {
    return (
        <Container maxWidth="lg">
            <h1>テストデータ作成フォーム</h1>
            <TestDataForm />
        </Container>
    );
};

export default withAuthenticator(App, { includeGreetings: true });
