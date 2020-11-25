const socketio = require('socket.io');
const tokenLib = require('./tokenLib')


let setServer = (server) => {
    //below 2 lines are-initialization of socket io library- after initializtion socket is now ready to use in server side
    let io = socketio.listen(server);
    let myIo = io.of('');      //global instance of socket

    //below line makes initial (client-server) handshake
    myIo.on('connection', (socket) => {
        //console.log('emittng verify user')
        socket.emit('verifyUser', '');
        socket.on('set-user', (authToken) => {
            tokenLib.verifyClaimsWithoutSecret(authToken, (err, user) => {
                if (err) {
                    console.log('fail to verify user')
                    socket.emit('auth-error', { status: 500, error: 'please provide correct authToken' })
                }
                else {
                    console.log('user is verified')
                    //every socket connection that is made to the server has the internal id of its own, but we set & use our own id
                    let currentUser = user.data;
                    socket.userId = currentUser.userId;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log(`${fullName} is online`);
                }
            })
        })//end listener of set-user


        socket.on('disconnect', () => {
            console.log("user is disconnected")
            console.log(socket.userId)
            console.log('went offline')
        })//end of disconnect

        socket.on('notify-updates', (data) => {
            //console.log(data)
            myIo.emit(data.userId, data);
        });
    })
}

module.exports = {
    setServer: setServer
}