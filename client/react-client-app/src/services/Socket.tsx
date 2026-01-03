import { createContext, useContext, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import { connect, disconnect } from "../redux/connection/connectionSlice";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();
    const socket = useMemo(() => io('http://localhost:3000', {
        autoConnect: false
    }), []);

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            dispatch(connect());
        });

        socket.on("disconnect", () => {
            dispatch(disconnect());
        });

        return () => {
            socket.disconnect();
            socket.off("connect");
            socket.off("disconnect");
        };
    }, [socket, dispatch]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
