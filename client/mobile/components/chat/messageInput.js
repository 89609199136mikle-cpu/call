/**
 * Message Input component
 * Handles text input, attachments, voice recording
 */

export function createMessageInput({
  onSend,
  onTyping,
  onAttach,
  onVoice,
  onSticker,
  replyTo = null,
  onCancelReply = null,
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-input-wrapper';
  wrapper.style.cssText = `
    background:var(--color-panel);
    border-top:1px solid var(--color-border);
    padding:8px 12px;
    flex-shrink:0;
  `;

  // Reply preview
  let replyBar = null;
  if (replyTo) {
    replyBar = _createReplyBar(replyTo, onCancelReply);
    wrapper.appendChild(replyBar);
  }

  const inputRow = document.createElement('div');
  inputRow.style.cssText = `
    display:flex;align-items:flex-end;gap:8px;
  `;

  // Attach button
  const attachBtn = _createIconBtn('📎', 'Attach file', () => onAttach?.());

  // Textarea
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Message...';
  textarea.rows = 1;
  textarea.style.cssText = `
    flex:1;
    background:var(--color-input-bg);
    color:var(--color-text);
    border:1px solid var(--color-border);
    border-radius:var(--radius-lg);
    padding:10px 14px;
    font-size:var(--font-size-md);
    font-family:var(--font-family);
    outline:none;
    resize:none;
    max-height:120px;
    line-height:1.5;
    transition:border-color var(--transition);
    overflow-y:auto;
  `;

  textarea.addEventListener('focus', () => {
    textarea.style.borderColor = 'var(--color-primary)';
  });
  textarea.addEventListener('blur', () => {
    textarea.style.borderColor = 'var(--color-border)';
  });

  let typingTimer;
  textarea.addEventListener('input', () => {
    _autoResize(textarea);
    if (typeof onTyping === 'function') {
      clearTimeout(typingTimer);
      onTyping(true);
      typingTimer = setTimeout(() => onTyping(false), 2000);
    }
    _toggleSendVoice();
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      _send();
    }
  });

  // Emoji button
  const emojiBtn = _createIconBtn('😊', 'Emoji', () => {
    // Emoji picker integration point
  });

  // Send / Voice button
  const actionBtn = document.createElement('button');
  actionBtn.style.cssText = `
    width:42px;height:42px;border-radius:50%;
    background:var(--color-primary);
    border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;
    transition:background var(--transition),transform var(--transition);
  `;
  actionBtn.innerHTML = _micIcon();
  actionBtn.setAttribute('aria-label', 'Send voice message');

  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];

  actionBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (text) {
      _send();
    } else {
      if (!isRecording) {
        await _startRecording();
      } else {
        _stopRecording();
      }
    }
  });

  actionBtn.addEventListener('mouseenter', () => { actionBtn.style.transform = 'scale(1.08)'; });
  actionBtn.addEventListener('mouseleave', () => { actionBtn.style.transform = 'scale(1)'; });

  inputRow.appendChild(attachBtn);
  inputRow.appendChild(emojiBtn);
  inputRow.appendChild(textarea);
  inputRow.appendChild(actionBtn);
  wrapper.appendChild(inputRow);

  function _send() {
    const text = textarea.value.trim();
    if (!text) return;
    onSend?.({ type: 'text', text, replyTo: replyTo?.id || null });
    textarea.value = '';
    _autoResize(textarea);
    _toggleSendVoice();
    clearTimeout(typingTimer);
    onTyping?.(false);
  }

  function _toggleSendVoice() {
    const hasText = textarea.value.trim().length > 0;
    actionBtn.innerHTML = hasText ? _sendIcon() : _micIcon();
    actionBtn.setAttribute('aria-label', hasText ? 'Send message' : 'Voice message');
  }

  async function _startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        onVoice?.({ type: 'voice', blob, duration: _formatDuration(recordingSeconds) });
        stream.getTracks().forEach((t) => t.stop());
        isRecording = false;
        _stopTimer();
        actionBtn.innerHTML = _micIcon();
        actionBtn.style.background = 'var(--color-primary)';
      };
      mediaRecorder.start();
      isRecording = true;
      actionBtn.innerHTML = _stopIcon();
      actionBtn.style.background = 'var(--color-danger)';
      _startTimer();
    } catch {
      alert('Microphone access denied');
    }
  }

  function _stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  let recordingSeconds = 0;
  let recordingTimer = null;
  let timerEl = null;

  function _startTimer() {
    recordingSeconds = 0;
    timerEl = document.createElement('div');
    timerEl.style.cssText = `
      position:absolute;top:-32px;left:0;right:0;
      text-align:center;font-size:var(--font-size-sm);
      color:var(--color-danger);font-weight:600;
    `;
    wrapper.style.position = 'relative';
    wrapper.appendChild(timerEl);
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      if (timerEl) timerEl.textContent = `🔴 ${_formatDuration(recordingSeconds)}`;
    }, 1000);
  }

  function _stopTimer() {
    clearInterval(recordingTimer);
    timerEl?.remove();
    timerEl = null;
    recordingSeconds = 0;
  }

  function _formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // Update reply bar
  wrapper.setReply = (reply) => {
    if (replyBar) replyBar.remove();
    if (reply) {
      replyBar = _createReplyBar(reply, () => {
        replyBar?.remove();
        replyBar = null;
        onCancelReply?.();
      });
      wrapper.insertBefore(replyBar, inputRow);
    } else {
      replyBar = null;
    }
  };

  wrapper.focus = () => textarea.focus();
  wrapper.clear = () => { textarea.value = ''; _autoResize(textarea); };

  return wrapper;
}

function _createReplyBar(replyTo, onCancel) {
  const bar = document.createElement('div');
  bar.style.cssText = `
    display:flex;align-items:center;gap:8px;
    padding:6px 10px;
    background:var(--color-input-bg);
    border-radius:var(--radius-sm);
    margin-bottom:6px;
    border-left:3px solid var(--color-primary);
  `;

  const info = document.createElement('div');
  info.style.cssText = `flex:1;overflow:hidden;`;

  const name = document.createElement('div');
  name.textContent = replyTo.senderName;
  name.style.cssText = `font-size:var(--font-size-xs);color:var(--color-primary);font-weight:600;`;

  const text = document.createElement('div');
  text.textContent = replyTo.text?.slice(0, 60) || 'Media';
  text.style.cssText = `font-size:var(--font-size-xs);color:var(--color-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;

  info.appendChild(name);
  info.appendChild(text);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `✕`;
  closeBtn.style.cssText = `background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:16px;padding:0 4px;`;
  closeBtn.addEventListener('click', onCancel);

  bar.appendChild(info);
  bar.appendChild(closeBtn);
  return bar;
}

function _createIconBtn(emoji, ariaLabel, onClick) {
  const btn = document.createElement('button');
  btn.innerHTML = `<span style="font-size:20px;">${emoji}</span>`;
  btn.setAttribute('aria-label', ariaLabel);
  btn.style.cssText = `
    background:transparent;border:none;cursor:pointer;
    width:36px;height:36px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;transition:background var(--transition);
  `;
  btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--color-hover)'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });
  btn.addEventListener('click', onClick);
  return btn;
}

function _autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function _sendIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>`;
}

function _micIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>`;
}

function _stopIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M6 6h12v12H6z"/></svg>`;
}
