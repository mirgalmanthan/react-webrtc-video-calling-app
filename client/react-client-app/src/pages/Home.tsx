import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useSocket } from "../services/Socket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const connection = useSelector((state: RootState) => state.connection.value);
  const socket = useSocket();
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  function handleJoinRoom() {
    socket?.emit('joined-room', {
      email,
      roomId
    });
  }

  useEffect(() => {
    socket?.on("user-joined", (data) => {
      console.log("User joined: " + data.email);
      navigate(`/room/${roomId}`);
    });

    return () => {
      socket?.off("user-joined");
    }
  }, [socket, roomId, navigate]);

  return (
    <>
      <label>Email</label>
      <input type="email" onChange={(e) => setEmail(e.target.value)} />
      <label>Room ID</label>
      <input type="text" onChange={(e) => setRoomId(e.target.value)} />
      <button onClick={handleJoinRoom}> Connect</button>
      {connection ? <p>Hello</p> : <p></p>}
    </>
  );
};
