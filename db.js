const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/keyword', {
    userNewUrlPareser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));