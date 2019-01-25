require('./removeByValue')();

module.exports = io => {
    const userList = [];

    io.on('connection', socket => {
        console.log('socket connected...');

        const session = socket.request.session.passport;
        const user = typeof session.user !== 'undefined' ? session.user : '';

        if(userList.indexOf(user.displayname) === -1){
            userList.push(user.displayname);
        }
        io.emit('join', userList);

        socket.on('client message', data => {
            io.emit('server message', {message: data.message, displayname: user.displayname});
        });

        socket.on('disconnect', () => {
            userList.removeByValue(user.displayname);
            io.emit('leave', userList);
        });
    });
}