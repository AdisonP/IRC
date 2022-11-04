var mongoose = require('mongoose'); 
var urlmongo = "mongodb://127.0.0.1:27017/irc"; 

mongoose.connect(urlmongo);
 
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 


const createConversation = (name, user) => {
    var exist = false;

    Conversation.find(function(err, conv){
        if(err){
            // error
            console.log(err);
        }
            if(conv.filter(e => e.name === arg).length == 0){
                const newConversation = new Conversation({
                    name: name,
                    members: [user.id],
                  });
                    newConversation.save();
            }else{
                
            }
    })
}