# Recreating an Arduino UNO
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

# Schematic

To start, I made a schematic of my board in Altium. I added decoupling
capacitors everywhere I could think to help provide instantaneous current to all
the hungry components. I had never assembled a crystal oscillator for a clock
before, and I felt like it was fairly informative. Basically, in the schematic,
where you can see "328 Crystal" and "CH340 USB to UART", if you look for the
crystal oscillator (the components with only four pins), you can see that the
crystal acts as a kind of band pass filter to keep an internal oscillator on the
ATmega and CH340 oscillating at 16MHz and 12MHz respectively.

One other interesting component is the transient voltage suppression diode
array, seen under "USB" in the schematic. It has an array of clipper circuits to
keep any voltage connected to one of its IO pins within the range specified
across the Zener diode at pins 2 and 5. I was surprised that this component is
capable of suppressing tens of volts of transient voltage. We put it on the USB
mini connector's data pins to protect whichever (much more expensive) device we
may plug into.

Lastly, I set up a reset pin with a 10k pullup resistor. This biases the reset
pin to be idle high, because the reset pin is active low. The 10k resistor and
the 1uF capacitor create an RC circuit with a time constant of $\tau = 10\times
10^{3} \cdot 1 \times 10^{-6} = 10\text{ms}$. This is used to debounce the reset
button. Another interesting part about the reset circuit is that we connect it
to the DTR pin of the CH340 through a series capacitor, which acts as a high
pass filter. The DTR pin is used when we program the ATmega.

<img src="https://raw.githubusercontent.com/simojo/www/tree/dev-svelte/imgs/golden-arduino--schematic.png" title="Altium schematic of golden Arduino." style="width: 100%;" />

# Layout

After painstakingly routing this board amid a conference deadline, I was able to
get it down to only five crossunders, four of which are under virtually constant
lines like 5V and 3V. I couldn't avoid crossing my UART TX line under the
ATmega's UART RX line. I had fun placing a silly gold bar silkscreen icon
showing off how this board is the "Golden Arduino" in terms of its signal
integrity!

<img src="https://raw.githubusercontent.com/simojo/www/tree/dev-svelte/imgs/golden-arduino--layout.png" title="Layout of golden Arduino." style="width: 100%;" />

# Finished Product

Surprisingly, I was able to burn the bootloader without any issue after
assembly. Of course, I checked for shorts between pins before powering on, but
there was no debug in the bring up process. It was eerie!

<img src="https://raw.githubusercontent.com/simojo/www/tree/dev-svelte/imgs/golden-arduino--assembled.jpg" title="Fully assembled golden Arduino." style="width: 100%;" />
