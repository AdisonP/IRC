import react, { useEffect, useState } from "react";
import ListUser from "../listuser/listuser";
import Chanel from '../chanel/chanel';
import Conversation from "../conversation/conversation";
import './chat.css';
import socketIOClient from "socket.io-client";
const ENDPOINT = 'http://localhost:3000/';
const socket = socketIOClient.connect(ENDPOINT);


const Chat = (props) => {

    const [users, setUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const [msg, setMsg] = useState("");


    useEffect(() => {
    }, []);
    



    return <div id="chatcpn">
        <h1>My Chat</h1>
        <div className="blocCenter">
        <Chanel/>
        <Conversation/>
        <ListUser/>
        </div>
    </div>
}

export default Chat;