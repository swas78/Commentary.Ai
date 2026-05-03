import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from './socket';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  latency: number;
}

// STUN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export function useWebRTC(roomCode: string, deviceId: string) {
  const [peers, setPeers] = useState<Record<string, PeerConnection>>({});
  const peersRef = useRef<Record<string, PeerConnection>>({});

  const createPeerConnection = useCallback((targetDeviceId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const socket = getSocket();

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-signal', {
          roomCode,
          target: targetDeviceId,
          source: deviceId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Data Channel setup for sub-10ms syncing
    if (isInitiator) {
      const dataChannel = pc.createDataChannel('sync', { negotiated: true, id: 0 });
      setupDataChannel(dataChannel, targetDeviceId);
      
      const newPeer = { connection: pc, dataChannel, latency: 0 };
      peersRef.current[targetDeviceId] = newPeer;
      setPeers({ ...peersRef.current });
    } else {
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, targetDeviceId);
        peersRef.current[targetDeviceId].dataChannel = event.channel;
        setPeers({ ...peersRef.current });
      };
      
      const newPeer = { connection: pc, latency: 0 };
      peersRef.current[targetDeviceId] = newPeer;
      setPeers({ ...peersRef.current });
    }

    return pc;
  }, [roomCode, deviceId]);

  const setupDataChannel = (channel: RTCDataChannel, targetDeviceId: string) => {
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') {
          channel.send(JSON.stringify({ type: 'pong', timestamp: data.timestamp }));
        } else if (data.type === 'pong') {
          const latency = (Date.now() - data.timestamp) / 2;
          if (peersRef.current[targetDeviceId]) {
            peersRef.current[targetDeviceId].latency = Math.round(latency);
            setPeers({ ...peersRef.current });
          }
        } else if (data.type === 'commentary') {
          // Dispatch to global store here in real implementation
          console.log('[WebRTC] Received commentary sync:', data.payload);
        }
      } catch (e) {
        console.error('Failed to parse WebRTC message', e);
      }
    };
  };

  // Broadcast function to send data to all connected peers instantly
  const broadcastData = useCallback((type: string, payload: any) => {
    const message = JSON.stringify({ type, payload, timestamp: Date.now() });
    Object.values(peersRef.current).forEach(peer => {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        peer.dataChannel.send(message);
      }
    });
  }, []);

  // Set up signaling listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSignal = async (data: any) => {
      if (data.target !== deviceId) return;

      let pc = peersRef.current[data.source]?.connection;

      try {
        if (data.signal.type === 'offer') {
          if (!pc) pc = createPeerConnection(data.source, false);
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-signal', {
            roomCode,
            target: data.source,
            source: deviceId,
            signal: answer
          });
        } else if (data.signal.type === 'answer') {
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
        } else if (data.signal.type === 'candidate') {
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
        }
      } catch (err) {
        console.error('[WebRTC] Signaling error', err);
      }
    };

    socket.on('webrtc-signal', handleSignal);

    // When a new device joins the room via Socket.io, initiate WebRTC connection
    socket.on('device-joined', async (newDevice: any) => {
      if (newDevice.id !== deviceId) {
        const pc = createPeerConnection(newDevice.id, true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-signal', {
          roomCode,
          target: newDevice.id,
          source: deviceId,
          signal: offer
        });
      }
    });

    return () => {
      socket.off('webrtc-signal', handleSignal);
      socket.off('device-joined');
    };
  }, [deviceId, roomCode, createPeerConnection]);

  // Ping interval to measure latency
  useEffect(() => {
    const interval = setInterval(() => {
      broadcastData('ping', null);
    }, 2000);
    return () => clearInterval(interval);
  }, [broadcastData]);

  return { peers, broadcastData };
}
