module.exports = (req, res, next) => {
    if(!req.isAuthenticated()){
        //res.redirect('/accounts/login');
        res.send('<script>alert("로그인이 필요한 서비스 입니다.");location.href="/accounts/login"</script>');
    }else{
        return next();
    }
};