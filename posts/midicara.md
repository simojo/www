# Midicara: A facially deterministic MIDI controller
## 
### 2023-09-07

# Overview

The majority instruments today assume that the instrumentalist is able to use their hands to some level of dexterity. In saying this, I'm not trying to create some straw man argument, rather I'm just trying to bring awareness to the fact. This project, dubbed **Midicara**, uses the [dlib](http://dlib.net) C++ library to perform facial landmark detection in order to control a MIDI instrument, thus doing away with the assumption of finger dexterity. The 'vanilla' use of the project, if you will, outputs on a single MIDI channel and allows the instrumentalist to play pitches, control velocity, and trigger `note_on` and `note_off` events.

# Reception

I was able to demo it with a large group of elementary students, and I found
that many people were shy to make music using their face, but, once they began,
many giggles followed. I think that more people should try to explore making
playable instrument modalities, because in many ways, the current instruments we
have are often limited in their shape or ortholinearity.

# Downsides

Unfortunately, the biggest downside of the project is that, depending on the
user's skin color, it may not perform the best. I think that dlib's facial
landmark predictor was trained on a subset of races.

# The Code

The whole project is buildable with the `nix` package manager, and runs using a
terminal user interface, so, no graphics libraries required.

The source code can be found here: [github.com/allegheny-audio/midicara](https://github.com/allegheny-audio/midicara)
