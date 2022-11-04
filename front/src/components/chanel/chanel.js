import react, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import chanel from './chanel.css'
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
const ENDPOINT = 'http://localhost:3000/';
const socket = socketIOClient.connect(ENDPOINT);

const Chanel = (props) => {
    const [response, setResponse] = useState("");
    const [channels, setChannels] = useState([]);
    var chan = [];
    const [msg, setMsg] = useState("");
    const [channel, setChannel] = useState("");
    const [conv, setConv] = useState([]);

    useEffect(() => {
        socket.on("newMessageAll", data => {
            setConv(currentConv => [...currentConv, data.message]);
            console.log(data);
          });
        socket.emit("getChannels");
        socket.on("channels", (data) => {
            chan = data.map(e => e.name);
            setChannels(chan);
            console.log(data);
        })

        socket.on('newChannel', (data) => {
            chan.push(data);
            var temp = [...chan]
            setChannels(temp);
            console.log(data);
        })
        
      }, []);

      const onChangeMsg = (e) =>{
        const ms = e.target.value; 
        setChannel(ms);
    };

    const send = (e) => {
        e.preventDefault();
        //socket.emit('cmd', {message: '/create toto'});
       // socket.emit('msg', {room: "toto", msg: "coucou"});
       socket.emit('newMessage', msg, "all");
       setMsg("");
    }

    const joinChannel = (e) => {
        e.preventDefault();
        socket.emit('joinChannel', channel);
        console.log('popo');
    }

    return <div id="channel">
        <h4>Liste des Channels</h4>
        <div id="listChannel">
            <ul>
            {channels.map(e => <li key={e}>{e}</li>)}
            </ul>
        </div>
    </div>
}

export default Chanel