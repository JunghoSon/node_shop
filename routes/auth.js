const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new FacebookStrategy(
        {
            clientID: '801723620161278',
            clientSecret: 'c210bb338ff5bd7dfa38bf5078f86be3',
            callbackURL: 'https://localhost:3000/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
         async (accessToken, refreshToken, profile, done) => {
            const {id, displayName, photos, email} = profile;

            try{
                const user = await UserModel.findOne({username: `fb_${id}`});

                if(!user){
                    const regData = {
                        username: `fb_${id}`,
                        password: 'facebook_login',
                        displayname: displayName
                    }
                    const newUser = new UserModel(regData);

                    await newUser.save();

                    done(null, regData);
                }else{
                    done(null, user);
                }
            }catch(err){
                throw err;
            }
        }
    )
);

router.get('/facebook', passport.authenticate('facebook', {scop: 'email'}));

router.get('/facebook/callback',
    passport.authenticate('facebook',{
        successRedirect: '/',
        failureRedirect: '/auth/facebook/fail'
    })
);

router.get('/facebook/success', (req, res) => {
    res.send(req.user);
});

router.get('/facebook/fail', (req, res) => {
    res.send('facebook login fail');
});

module.exports = router;