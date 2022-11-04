const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
const cors = require('cors');

var mongoose = require('mongoose'); 
var urlmongo = "mongodb://localhost/Chat"; 
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect(urlmongo, {useNewUrlParser : true, useUnifiedTopology: true}, function(err){
    if(err){
        console.log(err);
    }else{
        console.log('connected to mongodb');
    }
});

require('./models/Room');
require('./models/Message');
require('./models/User');
var User = mongoose.model('User');
var Room = mongoose.model('Room');
var Message = mongoose.model('Message');

app.use(cors());

var connectedUsers = [];

io.of("delete").adapter.on("delete-room", (room) => {
    console.log(`room ${room} was deleted`);
  });

io.on('connection', socket => {
    
    socket.on('pseudo', (pseudo) => {
        User.findOne({pseudo: pseudo}, (err, user) => {
            if(user){
                socket.broadcast.emit('newUser', pseudo);
            } else {
                var user = new User();
                user.pseudo = pseudo;
                user.save();
                socket.broadcast.emit('newUser', pseudo);
            }
            socket.pseudo = pseudo;
            joinRoom("general");
            if(!connectedUsers.map(u => u.pseudo).includes(pseudo)) {
                connectedUsers.push(socket);
            }
            io.emit('userList', connectedUsers.map(user => user.pseudo));
        })
    });

    socket.on('cmd', (data) => {
        if(data.charAt(0) === '/'){
            const split = data.split(" ");
            const cmd = split[0];
            const arg = split[1];
            

            console.log(socket.channel);

            switch(cmd){

                case '/join':
                    joinRoom(arg);
                    break;
                case '/nick':
                    User.findOne({pseudo: arg}, (err, user) => {
                        if(user){
                            socket.broadcast.emit('newUser', arg);
                        } else {
                            var user = new User();
                            user.pseudo = arg;
                            user.save();
                            socket.broadcast.emit('newUser', arg);
                        }
                        socket.pseudo = arg;
                        joinRoom("general");
                        if(!connectedUsers.map(u => u.pseudo).includes(arg)) {
                            connectedUsers.push(socket);
                        }
                        io.emit('userList', connectedUsers.map(user => user.pseudo));
                    })
                    console.log(socket.pseudo);
                    break;
                case '/editNick':
                    User.findOne({pseudo: arg}, (err, user) => {
                        if(user){
                            socket.emit("notif", "Ce pseudo est deja pris");
                        }else{
                            User.updateMany({psuedo: socket.pseudo}, {$set : {pseudo: arg}}, (err, res) => {
                                if(res){
                                    connectedUsers.forEach(e => {
                                        if(e.pseudo === socket.pseudo){
                                            e.pseudo = arg;
                                        }
                                    })
                                    socket.pseudo = arg;
                                    socket.emit("notif", "Votre pseudo a bein ete changé");
                                    io.emit('userList', connectedUsers.map(user => user.pseudo));
                                }
                            })
                        }
                    });
                    break;
                case '/leave':
                    socket.leave(arg);
                    joinRoom("general");
                    break;
                case '/msg':

                    var chat = new Message();
                    var temp = data.replace(cmd, '');
                    chat.text = temp.replace(arg, '');
                    chat.sender = socket.pseudo;
                    chat.receiver = arg;
                    chat.save();

                    console.log(chat);

                    User.findOne({pseudo: arg}, (err, user) => {
                        if(!user){
                            return false;
                        }else{
                            var socketReceiver = connectedUsers.find(e => e.pseudo === user.pseudo);
                            if(socketReceiver){
                                socketReceiver.emit('whisper', {sender: socket.pseudo, message: chat.text});
                            }
                        }
                    })

                    break;
                case '/users':
                    User.find((err, res) => {
                        if(res){
                            if(arg){
                                socket.emit('usersList', res.filter(e => e.pseudo.includes(arg)));
                                console.log( res.filter(e => e.pseudo.includes(arg)));
                            }else{
                                socket.emit('usersList', res);
                                console.log(res);
                            }
                        }
                    })
                    break;
                case '/list':
                    Room.find((err, res) => {
                        if(res){
                            if(arg){
                                socket.emit('roomList', res.filter(e => e.name.includes(arg)));
                            }else{
                                socket.emit('roomList', res);
                            }
                        }
                    })
                    break;
                case '/delete': 

                Room.findOne({name: arg}, (err, channel) =>{
                    if(channel){
                        if(arg === 'general'){
                            socket.emit("notif", "Le channel ne peut pas etre supprimmé");
                        }else{
                            Room.deleteOne(channel, (err, ch) => {
                                Room.find((err, res) => {
                                    if(res){
                                        io.emit('channels', res);
                                    }else{
                                        io.emit('channels', []);
                                    }
                                    connectedUsers.forEach(user => user.join('general'))
                                })
                                socket.emit("notif", "Le channel a bien ete supprimé");
                            })
                        }
                    }
                })
                break;
                case '/create':
                    var room = new Room();
                    room.name = arg;
                    room.save();           
                    io.emit("newChannel", arg);
                    socket.emit('notif', 'Le chanel a bien été crée.')
                    break;
                case '/edit':
                    Room.findOne({name: arg}, (err, room) => {
                        if(room){
                            socket.emit("notif", "Ce nom est deja pris");
                        }else{
                            Room.updateMany({name: socket.channel}, {$set : {name: arg}}, (err, res) => {
                                if(res){
                                    socket.emit("notif", "Le nom du channel a bein ete changé");
                                    Room.find((err, res) => {
                                        if(res){
                                            io.emit('channels', res);
                                        }else{
                                            io.emit('channels', []);
                                        }
                                    })
                                }
                            })
                        }
                    });
                    break;
            }
        }else{
            console.log("p -> " + socket.pseudo);
            console.log("p -> " + socket.channel);

            var chat = new Message();
            chat.id_conversation = socket.channel;
            chat.text = data;
            chat.sender = socket.pseudo;
            chat.receiver = "all";
            chat.save();

            socket.to(socket.channel).emit('newMessageAll', {message: data, pseudo: socket.pseudo});
        }
    })














































    socket.on('getUserList', () => {
        socket.emit('userList', connectedUsers);
    })

    socket.on('oldWhispers', (pseudo) => {
        Message.find({receiver: pseudo}, (err, messages) => {
            if(err){
                return false;
            }else{
                socket.emit("oldWhispers", messages)
            }
        })
    })

    socket.on('newMessage', (message, receiver) => {
            var chat = new Message();
            chat.id_conversation = socket.channel;
            chat.text = message;
            chat.sender = socket.pseudo;
            chat.receiver = receiver;
            chat.save();
            console.log(socket.pseudo);
            if(receiver === "all"){
                socket.broadcast.to(socket.channel).emit('newMessageAll', {message: message, pseudo: socket.pseudo});
            }else{
                User.findOne({pseudo: receiver}, (err, user) => {

                    if(!user){
                        return false;
                    }else{
                        var socketReceiver = connectedUsers.find(e => socket.pseudo === user.pseudo);
                        if(socketReceiver){
                            socketReceiver.emit('whisper', {sender: socket.pseudo, message: message})
                        }
                    }
                })
            }
    });

    socket.on('getUsers', () => {
        User.find((err, res) => {
            if(res){
                socket.emit('users', res);
            }else{
                socket.emit('users', []);
            }
        })
    });

    socket.on('getChannels', () => {
        Room.find((err, res) => {
            if(res){
                socket.emit('channels', res);
            }else{
                socket.emit('channels', []);
            }
        })
    });

    socket.on('joinChannel', (channel) => {
        joinRoom(channel);
    })

    socket.on('disconnect', () => {
        var index = connectedUsers.indexOf(socket);
        if(index > -1){
            connectedUsers.splice(index, 1);
        }
        socket.broadcast.emit('quitUser', socket.pseudo);
    })

    // Functions

    function joinRoom(channelParam){
        
        Room.findOne({name: channelParam}, (err, channel) => {
            if(channel){
                socket.broadcast.to(socket.channel).emit('newUserChannel', {pseudo : socket.pseudo, join: false});
                socket.leaveAll();
                socket.join(channelParam);
                socket.channel = channelParam;
                socket.broadcast.to(socket.channel).emit('newUserChannel', {pseudo : socket.pseudo, join: true});
                }else{
               /* var room = new Room();
                room.name = socket.channel;
                room.save();
                
                io.emit("newChannel", socket.channel);*/
                socket.emit("notif", "Le channel n'existe pas.");
            }
        })

    }

});



server.listen(3000, ()=>{
    //console.log("http://localhost:"+3000+"/")
})