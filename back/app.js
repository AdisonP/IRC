const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
const cors = require('cors');

// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'); 
const Conversation = require('./models/Message');
const Message = require('./models/Message');
 
//URL de notre base
var urlmongo = "mongodb://127.0.0.1:27017/irc"; 
 
// Nous connectons l'API à notre base de données
mongoose.connect(urlmongo);
 
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 

app.use(cors());

app.get('/', function(req, res){
    res.sendFile(`${__dirname}/public/index.html`)
})

const roomsDb = [{name : 'one', content : ['tu vas bien ?', 'oui']}];


io.on('connection', (socket)=>{
    //console.log("Connected");

    socket.on('disconnect', ()=>{
        //console.log('disconnected');
    })

    socket.on('msg', (data) => {
        io.to(data.room).emit("getMessage", {msg : data.msg})
        console.log(data.msg);
        
        //console.log(io.sockets.manager.roomClients[socket.id])

    })

    // message privé
        socket.on("private message", (anotherSocketId, msg) => {
          socket.to(anotherSocketId).emit("private message", socket.id, msg);
        });
    

    socket.on('create', (room) => {
        socket.join(room);
    })

    socket.on('roomList', () => {
        io.emit('roomList',Array.from(io.sockets.adapter.rooms))
    })


    socket.on('msgroom', (data) => {
        console.log('tpto');
        io.to(data.room).emit(data.msg);
        console.log('msg => ' + data.msg + ', room => ' + data.room);
    })

    socket.on('error', (err) => {
        //console.log('client disconnect...'+ socket.id)
        handleDisconnect()
    })

    socket.on('cmd', (data) => { 
        if(data.message.charAt(0) === '/'){
            const split = data.message.split(" ");
                const cmd = split[0];
                const arg = split[1];
    
                switch(cmd){
                    case '/join':
                        // join channel
                        socket.join(arg);
                        var ct = false;
                        roomsDb.forEach(e => {if(e.name == arg){ct = true}});
                        if(!ct){
                            roomsDb.push({name : arg, content : []});
                            
                        }
                        io.emit('switchconv', roomsDb.forEach(e => {if(e.name == arg){return e.content;}}))
                        console.log();
                        console.log(socket.rooms);
    
                        break;
                    case '/create':
                        // create channel
                        socket.join(arg);
                        Conversation.find(function(err, conv){
                            if(err){
                                return {status : 0, error : err}
                            }
                                if(conv.filter(e => e.name === arg).length == 0){
                                    const newConversation = new Conversation({
                                        name: arg,
                                        members: [socket.id],
                                      });
                                        newConversation.save();
                                        return{status : 200}
                                }else{
                                    return {status : 201, error : 'Le channel existe deja vous allez etre redirigé vers celui ci'}
                                }
                        })
                        break;
                    case '/leave':
                        // leave
                        socket.leave(arg);
                        break;
                    case '/delete':
                        // delete channel
                        break;
                    case '/nick': 
                        // define the nickname of the user on the server
                        socket.nickname = arg;
                        console.log(socket.rooms);
                        break;
                    case '/list':
                        // list all channel
                       const channList = [];
                       Array.from(io.sockets.adapter.rooms).forEach(room => {
                           channList.push(room.id);
                       })
                       console.log(Array.from(io.sockets.adapter.rooms));
                        break;
                    case '/list*':
                        // list all channel contains charac
                        const l = [];
                        Array.from(io.sockets.adapter.rooms).forEach(element => {
                            console.log(element);
                            if(String(element[0]).includes(arg)){
                                l.push(element[0]);
                            }
                        });
                        console.log(l);
                        break;
                    case '/users':
                        // list all users
                        const userList = [];
                        io.sockets.sockets.forEach(element => {
                            userList.push({ id :element.id, name: element.nickname});
                        });
                        console.log(userList);
                        break;
                    case '/users*':
                        // list all user that name contains str 
                        const duserList = [];
                        io.sockets.sockets.forEach(element => {
                            if(String(element.nickname).includes(arg)){
                                duserList.push({ id :element.id, name: element.nickname});
                            }
                        });
                        console.log(duserList);
                        break;
                    case '/msg':
                        // take nickname [second param] and send message [trihd param]
                        break;

                }
        }

    })
})


app.get("/conv", (req, res) => {
        
     Conversation.find(function(err, conv){
        if(err){
            res.send(err);
        }
        res.json(conv);
    })
})


server.listen(3000, ()=>{
    //console.log("http://localhost:"+3000+"/")
})