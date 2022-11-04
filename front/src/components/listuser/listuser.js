import react, { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './listuser.css';
import socketIOClient from "socket.io-client";
const ENDPOINT = 'http://localhost:3000/';
const socket = socketIOClient.connect(ENDPOINT);


const ListUser = (props) => { 
    const [users, setUsers] = useState([]);

    useEffect(() => {
        let mountain = true;

        if(mountain) {
            socket.on('userList',(data) => {
                console.log(data);
                setUsers(data);
            })
        }
    }, [])


    return <div id="listUser">
        {users.map(e => <Button key={e} classname="btn btn-outline-dark"> {e} </Button>)}
    </div>
}

export default ListUser;