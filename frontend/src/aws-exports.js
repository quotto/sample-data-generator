const awsmobile = {
    Auth: {
        identityPoolRegion: process.env.REACT_APP_AWS_REGION,
        identityPoolId: process.env.REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID,
        region: process.env.REACT_APP_AWS_COGNITO_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEB_CLIRNT_ID,
    }
};

export default awsmobile;
