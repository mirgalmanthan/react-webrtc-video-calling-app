import { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../services/Socket";
import { usePeer } from "../services/Peers";


export const Room = () => {

    const [myStream, setMyStream] = useState<MediaStream | null>(null);
        const [remoteEmailId, setRemoteEmailId] = useState<string | null>(null);
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socket = useSocket();
    const { peer, createOffer, acceptOffer, setRemoteAnswer, sendStream, remoteStream } = usePeer();
    const [logs, setLogs] = useState<string[]>([]);

    const getUserMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            console.log("Stream received:", stream);
            setMyStream(stream);
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    }, [])

    const handlerNewConnection = useCallback(async (data: any) => {
        setLogs((prevLogs) => [...prevLogs, "User joined: " + data.email]);
        const offer = await createOffer();
        socket?.emit('send-offer', {
            offer,
            to: data.email
        })
        setRemoteEmailId(data.email);
    }, [createOffer, socket]);

    const handlerOffer = useCallback(async (data: any) => {
        const { offer, from } = data;
        console.log("Offer received from: " + from);
        let answer = await acceptOffer(offer);
        socket?.emit('offer-accepted', {
            answer,
            to: from
        })
        setRemoteEmailId(from);
    }, []);

    const handlerAnswer = useCallback(async (data: any) => {
        const { answer, from } = data;
        console.log("Answer received from: " + from);
        await setRemoteAnswer(answer);
    }, [setRemoteAnswer]);

    useEffect(() => {
        socket?.on("new-user-joined", handlerNewConnection);
        socket?.on("offer", handlerOffer);
        socket?.on("answer", handlerAnswer);

        return () => {
            socket?.off("new-user-joined", handlerNewConnection);
            socket?.off("offer", handlerOffer);
        }
    }, [socket, handlerNewConnection, handlerOffer]);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream]);

    useEffect(() => {
        if (myVideoRef.current && myStream) {
            myVideoRef.current.srcObject = myStream;
        }
        if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [myStream, remoteStream]);

    const handleNegotiation = async () => {
        const localOffer = peer.localDescription;
        socket?.emit('send-offer', {
            offer: localOffer,
            to: remoteEmailId!
        })
    }
    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation);

        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation);
        }
    }, [peer, handleNegotiation]);
    return (
        <div>
            <h1>Room</h1>
            <button onClick={e => sendStream(myStream!)}>Send Video</button>
            {myStream && <video ref={myVideoRef} autoPlay playsInline muted style={{ width: '500px', height: '300px' }} />}
            {remoteStream && <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '500px', height: '300px' }} />}
            <ul style={{ listStyle: "none" }}>
                {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                ))}
            </ul>
        </div>
    );
};