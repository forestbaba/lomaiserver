const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 13000;
const cors = require('cors');
const logger = require('morgan');
const User = require('./api/users/user');
const Post = require('./api/posts/post');

app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors()) 

app.use('/api/v1/user', User);
app.use('/api/v1/post', Post);


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})