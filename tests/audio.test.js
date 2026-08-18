import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SOUND_PATTERNS,
  createSoundController,
  updateSoundButton
} from '../script.js';

class FakeAudioParam {
  constructor() {
    this.events = [];
  }

  setValueAtTime(value, time) {
    this.events.push({ method: 'set', value, time });
  }

  linearRampToValueAtTime(value, time) {
    this.events.push({ method: 'ramp', value, time });
  }
}

class FakeOscillator {
  constructor() {
    this.frequency = new FakeAudioParam();
    this.startedAt = null;
    this.stoppedAt = null;
    this.type = '';
  }

  connect(node) {
    this.connectedTo = node;
    return node;
  }

  start(time) {
    this.startedAt = time;
  }

  stop(time) {
    this.stoppedAt = time;
  }
}

class FakeGain {
  constructor() {
    this.gain = new FakeAudioParam();
  }

  connect(node) {
    this.connectedTo = node;
    return node;
  }
}

class FakeAudioContext {
  static instances = [];

  constructor() {
    this.currentTime = 10;
    this.destination = {};
    this.gains = [];
    this.oscillators = [];
    this.resumeCalls = 0;
    this.state = 'suspended';
    FakeAudioContext.instances.push(this);
  }

  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  resume() {
    this.resumeCalls += 1;
    this.state = 'running';
    return Promise.resolve();
  }
}

test('starts enabled and suppresses audio while muted', () => {
  FakeAudioContext.instances = [];
  const sound = createSoundController(FakeAudioContext);

  assert.equal(sound.isEnabled(), true);
  assert.equal(sound.toggle(), false);
  sound.playMove('X');
  assert.equal(FakeAudioContext.instances.length, 0);

  assert.equal(sound.toggle(), true);
  sound.playMove('X');
  assert.equal(FakeAudioContext.instances.length, 1);
  assert.equal(FakeAudioContext.instances[0].resumeCalls, 1);
});

test('schedules distinct synthesized X and O bleeps', () => {
  FakeAudioContext.instances = [];
  const sound = createSoundController(FakeAudioContext);

  sound.playMove('X');
  sound.playMove('O');

  const frequencies = FakeAudioContext.instances[0].oscillators.map(
    (oscillator) => oscillator.frequency.events[0].value
  );
  assert.deepEqual(frequencies, [SOUND_PATTERNS.X[0].frequency, SOUND_PATTERNS.O[0].frequency]);
  assert.notEqual(frequencies[0], frequencies[1]);
});

test('uses an ascending win jingle and lower draw tones', () => {
  assert.equal(SOUND_PATTERNS.win.length, 3);
  assert.ok(
    SOUND_PATTERNS.win.every((note, index, notes) =>
      index === 0 || note.frequency > notes[index - 1].frequency
    )
  );
  assert.ok(
    SOUND_PATTERNS.draw.every((note) =>
      note.frequency < SOUND_PATTERNS.win[0].frequency
    )
  );

  FakeAudioContext.instances = [];
  const sound = createSoundController(FakeAudioContext);
  sound.playResult({ type: 'win' });
  sound.playResult({ type: 'draw' });

  assert.equal(
    FakeAudioContext.instances[0].oscillators.length,
    SOUND_PATTERNS.win.length + SOUND_PATTERNS.draw.length
  );
});

test('updates visible and accessible sound-button state', () => {
  const attributes = new Map();
  const button = {
    dataset: {},
    textContent: '',
    setAttribute(name, value) {
      attributes.set(name, value);
    }
  };

  updateSoundButton(button, false);
  assert.equal(button.dataset.soundEnabled, 'false');
  assert.equal(button.textContent, 'Sound: Off');
  assert.equal(attributes.get('aria-pressed'), 'false');
  assert.equal(attributes.get('aria-label'), 'Enable sound');

  updateSoundButton(button, true);
  assert.equal(button.dataset.soundEnabled, 'true');
  assert.equal(button.textContent, 'Sound: On');
  assert.equal(attributes.get('aria-pressed'), 'true');
  assert.equal(attributes.get('aria-label'), 'Mute sound');
});
