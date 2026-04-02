{
  "metadata": {
    "project": "Craneapp Messenger",
    "sound_engine": "Web Audio API / HTML5 Audio",
    "format": "mp3/ogg",
    "bitrate": "192kbps"
  },
  "notifications": {
    "message_in": {
      "id": "snd_msg_in",
      "url": "sounds/notifications/message_incoming.mp3",
      "priority": "high",
      "volume": 0.8,
      "description": "Стандартный звук входящего сообщения"
    },
    "message_out": {
      "id": "snd_msg_out",
      "url": "sounds/notifications/message_sent.mp3",
      "priority": "low",
      "volume": 0.5,
      "description": "Легкий клик при успешной отправке"
    },
    "mention": {
      "id": "snd_mention",
      "url": "sounds/notifications/mention.mp3",
      "priority": "critical",
      "volume": 1.0,
      "description": "Особый тон для @упоминаний"
    },
    "group_msg": {
      "id": "snd_group",
      "url": "sounds/notifications/group_soft.mp3",
      "priority": "medium",
      "volume": 0.6,
      "description": "Приглушенный звук для групповых чатов"
    }
  },
  "calls": {
    "ringtone": {
      "id": "snd_ringtone",
      "url": "sounds/calls/crane_ringtone_loop.mp3",
      "loop": true,
      "fade_in": 2000,
      "description": "Фирменная мелодия входящего звонка (Neon Synth)"
    },
    "dialing": {
      "id": "snd_dialing",
      "url": "sounds/calls/dialing_tone.mp3",
      "loop": true,
      "description": "Гудки при исходящем вызове"
    },
    "call_end": {
      "id": "snd_call_end",
      "url": "sounds/calls/call_finished.mp3",
      "volume": 0.7,
      "description": "Звук завершения разговора"
    },
    "waiting": {
      "id": "snd_waiting",
      "url": "sounds/calls/on_hold.mp3",
      "loop": true,
      "description": "Музыка в режиме ожидания"
    }
  },
  "ui": {
    "app_start": {
      "id": "snd_startup",
      "url": "sounds/system/startup_glow.mp3",
      "volume": 0.4
    },
    "error": {
      "id": "snd_error",
      "url": "sounds/system/error_alert.mp3",
      "volume": 0.6
    },
    "camera_shutter": {
      "id": "snd_camera",
      "url": "sounds/system/shutter.mp3",
      "volume": 1.0
    },
    "mic_on": {
      "id": "snd_mic_on",
      "url": "sounds/system/mic_activate.mp3",
      "volume": 0.3
    },
    "mic_off": {
      "id": "snd_mic_off",
      "url": "sounds/system/mic_mute.mp3",
      "volume": 0.3
    }
  },
  "settings": {
    "vibration_pattern_msg": [0, 100, 50, 100],
    "vibration_pattern_call": [0, 500, 200, 500],
    "audio_category": "ambient"
  }
}
