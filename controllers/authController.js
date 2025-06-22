const Faculty = require('../models/Faculty');

exports.getLogin = (req, res) => {
    if (req.session.faculty) {
        return res.redirect('/dashboard');
    }
    res.render('auth/login', {
        title: 'Faculty Login'
    });
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const faculty = await Faculty.findOne({ email });

        if (!faculty || !(await faculty.matchPassword(password))) {
            return res.render('auth/login', { error: 'Invalid email or password', title: 'Faculty Login' });
        }

        req.session.faculty = {
            id: faculty._id,
            name: faculty.name,
        };
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error' });
    }
};

exports.getRegister = (req, res) => {
    if (req.session.faculty) {
        return res.redirect('/dashboard');
    }
    res.render('auth/register', {
        title: 'Faculty Registration'
    });
};

exports.postRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let faculty = await Faculty.findOne({ email });
        if (faculty) {
            return res.render('auth/register', { error: 'Faculty with this email already exists', title: 'Faculty Registration' });
        }
        faculty = await Faculty.create({ name, email, password });
        req.session.faculty = {
            id: faculty._id,
            name: faculty.name,
        };
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};