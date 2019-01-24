const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const passwordHash = require('../libs/passwordHash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser((user, done) => {
    console.log('deserializeUser');
    const result = user;
    result.password = '';
    done(null, result);
});

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            const user = await UserModel.findOne({username, password: passwordHash(password)});

            if(!user){
                done(null, false, {message: '아이디 또는 비밀번호 오류 입니다.'});
            }else{
                done(null, user);
            }
        }
    )
);

router.get('/', (req, res) => {
    res.send('accounts app');
});

router.get('/join', (req, res) => {
    res.render('accounts/join');
});

router.post('/join', async (req, res) => {
    const {username, password, displayname} = req.body;

    const user = new UserModel({username, password: passwordHash(password), displayname});

    try{
        await user.save();
        res.send('<script>alert("회원가입 성공");\
        location.href="/accounts/login";</script>');
    }catch(err){
        throw err;
    }
});

router.get('/login', (req, res) => {
    res.render('accounts/login', {flashMessage: req.flash().error});
});

router.post('/login',
    passport.authenticate('local',
        {
            failureRedirect: '/accounts/login',
            failureFlash: true
        }
    ),
    (req, res) => {
        res.send('<script>alert("로그인 성공!!");location.href="/";</script>');
    }
);

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/accounts/login');
});

module.exports = router;