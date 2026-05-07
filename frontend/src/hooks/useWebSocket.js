import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function useWebSocket() {
  const [data, setData] = useState({
    cpu: 0, memoryUsedMB: 0, memoryTotalMB: 0, memoryPercent: 0, alert: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("flux-token");
    if (!token) return;

    const socket = new SockJS("https://localhost:8443/ws");
    const client = Stomp.over(socket);
    client.debug = null;
    const headers = { Authorization: `Bearer ${token}` };
    client.connect(headers, () => {
      client.subscribe("/topic/metrics", msg => setData(JSON.parse(msg.body)));
    });
    return () => { try { if (client.connected) client.disconnect(); } catch {} };
  }, []);

  return data;
}
