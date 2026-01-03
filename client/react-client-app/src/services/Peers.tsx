import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const PeerContext = createContext<{
    peer: RTCPeerConnection,
    createOffer: () => Promise<RTCSessionDescriptionInit>,
    acceptOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>,
    setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>,
    sendStream: (stream: MediaStream) => Promise<void>
    remoteStream: MediaStream | null
} | null>(null);

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const peer = useMemo(() => {
        return new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302'
                    ]
                }
            ]
        })
    }, []);


    const createOffer = useCallback(async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }, [peer]);

    const acceptOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }, [peer]);

    const setRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        try {
            console.log("Setting remote answer. Current signaling state:", peer.signalingState);
            if (peer.signalingState === "have-local-offer") {
                await peer.setRemoteDescription(answer);
            } else {
                console.warn("Ignoring remote answer because we are not in 'have-local-offer' state. Current state:", peer.signalingState);
            }
        } catch (error) {
            console.error("Failed to set remote answer:", error);
        }
    }, [peer]);

    const sendStream = useCallback(async (stream: MediaStream) => {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
            peer.addTrack(track, stream);
        });
    }, [peer]);



    const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
        const streams = event.streams;
        setRemoteStream(streams[0]);
    }, [setRemoteStream])

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);
        return () => {
            peer.removeEventListener('track', handleTrackEvent);
        }
    }, [peer, handleTrackEvent]);

    return (
        <PeerContext.Provider value={{ peer, createOffer, acceptOffer, setRemoteAnswer, sendStream, remoteStream }}>
            {children}
        </PeerContext.Provider>
    );


}

export const usePeer = () => {
    const state = useContext(PeerContext);
    if (!state) throw new Error("usePeer must be used within a PeerProvider");
    return state;
};