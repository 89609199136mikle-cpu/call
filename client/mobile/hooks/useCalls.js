/**
 * CraneApp Calls Hook
 * VoIP call management + history + WebRTC
 */

export function useCalls() {
  const calls = {
    history: [],
    activeCall: null,
    isInCall: false,
    isLoading: false
  };

  // Load call history
  async function loadCallHistory() {
    calls.isLoading = true;
    
    try {
      // Mock call history
      calls.history = [
        { id: 1, contact: 'Alice Johnson', type: 'video', time: 'Today, 14:30', duration: '00:45', outgoing: true },
        { id: 2, contact: 'Bob Wilson', type: 'voice', time: 'Today, 10:15', duration: '02:13', incoming: true, missed: true },
        { id: 3, contact: 'Carol Davis', type: 'video', time: 'Mar 10', duration: '00:58', outgoing: true }
      ];
      
      window.callsData = calls.history;
      window.dispatchEvent(new CustomEvent('calls:loaded'));
      
    } finally {
      calls.isLoading = false;
    }
  }

  // Start call (WebRTC)
  async function startCall(contactId, type = 'voice') {
    calls.activeCall = {
      id: Date.now(),
      contactId,
      type,
      status: 'ringing',
      startTime: Date.now()
    };
    calls.isInCall = true;
    
    // Socket signaling
    window.SocketProvider.startCall(contactId, type);
    
    window.dispatchEvent(new CustomEvent('call:started', { 
      detail: calls.activeCall 
    }));
    
    return calls.activeCall;
  }

  // Answer incoming call
  function answerCall() {
    if (calls.activeCall) {
      calls.activeCall.status = 'connected';
      window.dispatchEvent(new CustomEvent('call:answered'));
    }
  }

  // End call
  function endCall() {
    if (calls.activeCall) {
      const duration = Math.floor((Date.now() - calls.activeCall.startTime) / 1000);
      calls.activeCall.duration = new Date(duration * 1000).toISOString().substr(14, 5);
      calls.activeCall.status = 'ended';
      
      calls.history.unshift(calls.activeCall);
      calls.activeCall = null;
      calls.isInCall = false;
      
      window.dispatchEvent(new CustomEvent('call:ended'));
    }
  }

  // Socket events
  window.addEventListener('socket:call-offer', (e) => {
    calls.activeCall = {
      id: Date.now(),
      contactId: e.detail.from,
      type: e.detail.type,
      status: 'incoming',
      startTime: Date.now()
    };
    calls.isInCall = true;
    
    window.dispatchEvent(new CustomEvent('call:incoming', { 
      detail: calls.activeCall 
    }));
  });

  // Initialize
  loadCallHistory();

  window.CallProvider = {
    loadCallHistory,
    startCall,
    answerCall,
    endCall,
    state: calls
  };

  return {
    calls: () => calls.history,
    activeCall: () => calls.activeCall,
    isInCall: () => calls.isInCall,
    isLoading: () => calls.isLoading,
    startCall,
    answerCall,
    endCall,
    loadCallHistory
  };
}
