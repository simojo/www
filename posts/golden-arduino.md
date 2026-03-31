# WIP: Recreating an Arduino UNO
## Let's make an Arduino UNO with better signal integrity.
### 2026-03-31

The Arduino UNO is, in many ways, a breakout board for the ATmega328P with added
features like an onboard EEPROM, voltage regulator, and CH340 USB to serial
converter. Specifically, the UNO R3 is a two-layer board featuring many
crossunders, which creates a discontinuous ground plane and, at high speeds can
lead to crosstalk or even ground bounce.

# Crosstalk

Any conducting material is going to have some inductance, usually given in units
of $\text{nH} m^{-1}$ _(nanohenries per meter)_. This is super small, and you
might think "this is negligble!" But if we look at Faraday's Law:

$$
\mathcal{E} = -\frac{\text{d}\Phi_B}{\text{d}t}
$$

We see that the _induced electromotive force_ around a closed circuit is related
to how fast magnetic flux may be changing through a circuit. Even more important
is that it's inversely proportional to changes in time, meaning that, for
shorter rise and fall times of signals, these effects will effectively **blow
up**.

The inductance of a material defines how much magnetic field it creates when
current flows through it in a loop. This relationship is given by
$L = \frac{\Phi}{I}$, which means that, for every trace in a PCB, if it is
inductive (all are), then neighboring traces may experience a voltage drop
according to Faraday's Law,

$$
V = L \frac{\text{d}I}{\text{d}t}.
$$

Because each trace has some inductance-per-length, longer traces, _especially
long traces next to each other_, have the potential to dance with each other
when one of them switches. **This is why it's so important that we reduce the
length of traces and return paths in a layout.**

## Crosstalk and Return Paths

People always say that electricity follows the "path of least resistance," which
is true, but is missing perhaps a more nuanced definition of "resistance."
Electricity follows the path of least _impedance_, which includes the notion of
frequency-dependent effects. In the context of a signal with a return plane
under it, this is often the path directly under the return plane. When we route
switching signals like IO lines or serial lines under each other, we are
disrupting that path, forcing the signal above to go _all the way around_ the
crossunder area. As we just saw before, that can drastically increase the total
inductance of a circuit, and in the case of the UNO R3, this is exactly why it's
not an optimal design.

In short, having a continuous ground plane helps with signal integrity, which is
exactly why state of the art boards may have a ground plane stuffed in between
each signal layer in 30-layer designs.

# My Schematic

To start, I made a schematic of my board in Altium.
