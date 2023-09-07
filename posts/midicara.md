# Midicara: A facially deterministic MIDI controller
## 
### 2023-09-07

The majority instruments today assume that the instrumentalist is able to use their hands to some level of dexterity. In saying this, I'm not trying to create some straw man argument, rather I'm just trying to bring awareness to the fact. This project, dubbed **Midicara**, uses the [dlib](http://dlib.net) C++ library to perform facial landmark detection in order to control a MIDI instrument, thus doing away with the assumption of finger dexterity. The 'vanilla' use of the project, if you will, outputs on a single MIDI channel and allows the instrumentalist to play pitches, control velocity, and trigger `note_on` and `note_off` events.

The source code can be found here: [github.com/allegheny-audio/midicara](https://github.com/allegheny-audio/midicara)
