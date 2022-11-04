import react, { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './conversation.css';
import socketIOClient from "socket.io-client";

const ENDPOINT = 'http://localhost:3000/';
const socket = socketIOClient.connect(ENDPOINT);

const Conversation = (props) => {
    const [message, setMessage] = useState("");

    const [conversation, setConversation] = useState([]);
    const conv = [];

    useEffect(() => {

        while (!pseudo){
            var pseudo = prompt("Quel est votre pseudo ?");
        } 
        socket.emit('cmd', ('/nick ' + pseudo));
        socket.on('newMessageAll', (data) => {
            conv.push(<p>{data.pseudo} : {data.message}</p>);
            const tmp = [...conv];
            setConversation(tmp)
         })

      socket.on('whisper', (data) => {
        conv.push(<p className="notification">message privé de - {data.sender} : {data.message} </p>);
        const tmp = [...conv];
        setConversation(tmp)        
      })

      socket.on('notif', (data) => {
        conv.push(<p className="urgent">{data} </p>);
        const tmp = [...conv];
        setConversation(tmp)        
      })

      socket.on('newUserChannel', data => {
        var asJoin = data.join ? "rejoindre" : "quiter";
        conv.push(<p className="urgent"> {data.pseudo} vient de {asJoin} : le channel </p>);
        const tmp = [...conv];
        setConversation(tmp);
      })

      socket.on('roomList', data => {
          var res = "";
          if(data.length === 0){
            res = <p className="urgent">aucun channel trouvé</p>;
          }else{
              res = <ul className="second">{data.map(e => <li key={e}> {e.name} </li>)}</ul>;      
          }

          conv.push(res);
          const tmp = [...conv];
          setConversation(tmp);
      })

      socket.on('usersList', data => {
        var res = "";
        if(data.length === 0){
          res = <p className="urgent">aucun utilisateur trouvé</p>;
        }else{
           res = <ul className="second">{data.map(e => <li key={e}> {e.pseudo} </li>)}</ul>;      
        }

        conv.push(res);
        const tmp = [...conv];
        setConversation(tmp);
    })
    }, []);

    //const textInput = document.getElementById('conversation').value;
    //const receiver = document.getElementById('receiverInput').value;

    const onChangeMessage = (e) => {
        const msg = e.target.value;
        setMessage(msg);
        
    }
    const sendMessage = (e) => {
        e.preventDefault();
        setMessage("");
        socket.emit('cmd', message);
    }
    return <div id="convBloc">
        <div id="render">
          {conversation.map(e => e)}
        </div>
        <form id="conversation" onSubmit={sendMessage}>
          <div id="botSegment">
          <input type="text" id="text_input" onChange={onChangeMessage} value={message}/>
          <Button type="submit" variant="primary" id="submit">send</Button>
          </div>
    </form>
    </div>

}

//ReactDOM.render(<Conversation />, document.getElementById('root'));

export default Conversation;