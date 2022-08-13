# The Gap
## assignment04 - understanding the gap
### 2022-03-015

This article talks about the gap where I do not understand things about my future research interest. I also present methods by which I will minimize this gap and get closer to the understanding of the people who are presenting this research.

1. Summarize the knowledge gap that emerges from your chosen research area.

The knowledge gap in my research area *(quantum computing, embedded systems)* would be my limitations in my experience with working with embedded systems and low level systems programming. I have not had much experience taking in sensor data, such data that would have to be recorded when reading energies of outputs from a quantum computer. I have not had very much time to work with automated systems and arrays of sensors.

Another area that I do not have very much experience with is in the field of quantum computing and quantum optics. Most quantum computers leverage optics and advanced topics in quantum physics to do its work. There is a lot of terminology around "qubits" and "quantum states" that are not familiar to me yet. Quantum physics uses notation that pulls from linear algebra called "bra-ket notation" that has to do with complex vector multiplication. I have not taken an upper level quantum physics course yet. Though I have spent frequent time in the quantum physics textbook for the upper level course, I have had a hard time taking ownership of the information in this textbook.

2. How do you know that a gap exists? How does relevant literature motivate or provide justification to the completion of the gap? Identify at least four research articles or other materials which identify the gap. Please include four references in this discussion. Note: it is entirely likely that new references may need to be discovered for this discussion.

#### Optical quantum memory based on electromagnetically induced transparency
```
Ma, Lijun, Oliver Slattery, and Xiao Tang. "Optical quantum memory based on electromagnetically induced transparency." Journal of Optics 19.4 (2017): 043001.
```
This article uses arbitrary bra-ket notation in describing how energy levels of qubits can be transferred via transmissions of light. It also discusses the decay of a quantum state, which is something I am not aware of. I need to spend more time learning the notation and understanding how quantum states are preserved for long periods of time.

#### Experimental QND measurements of complementarity on two-qubit states with IonQ and IBM Q quantum computers
```
Schwaller, Nicolas, Valeria Vento, and Christophe Galland. "Experimental QND measurements of complementarity on two-qubit states with IonQ and IBM Q quantum computers." Quantum Information Processing 21.2 (2022): 1-24.
```
This article uses the technology from a company called **IonQ**. **IonQ** is working on creating quantum computing circuits that use trapped ions because their positive charge allows them to be isolated by their coulomb force. I understand this technology, but I do not understand how they are manipulating the quantum states with an optical system. Apparently they send microwave and infrared radiation into the trapped containment to store what is called the "hyperfine spin state" of these ions, meaning that they actually can change the orientation of a spinning electron by shooting microwave radiation at these trapped ions. **I will need to do more background research into figuring out how these optical systems work.**

#### Wide Field Of View Varifocal Near-Eye Display Using See-Through Deformable Membrane Mirrors
```
D. Dunn et al., "Wide Field Of View Varifocal Near-Eye Display Using See-Through Deformable Membrane Mirrors," in IEEE Transactions on Visualization and Computer Graphics, vol. 23, no. 4, pp. 1322-1331, April 2017, doi: 10.1109/TVCG.2017.2657058.
```
This article presents a new technology that uses gaze tracking to rapidly change the focal length of a membrane placed in front of the eye to be used in augmented reality applications. The differential here arises in the fact that I have never worked with gaze tracking software of any sort. I would like to work closely with technology like this, but I need to find a good open source tool that uses gaze tracking technology.

#### Mitigating vergence-accommodation conflict for near-eye displays via deformable beamsplitters
```
Dunn, David, et al. "Mitigating vergence-accommodation conflict for near-eye displays via deformable beamsplitters." Digital Optics for Immersive Displays. Vol. 10676. International Society for Optics and Photonics, 2018.
```
This article discusses a better implementation of a deformable sheet of glass that is used to increase the clarity of an image for someone wearing a augmented reality headset. This uses advanced optics and a pneumatic system that uses air pressure to bend these displays. The proposed design changes the form factor and makes it much smaller, although it does not fix the problem of having to use an pneumatic system. I do not understand anything about flexible beam splitters and pneumatic systems that bend these beam splitters! The good thing about this research, however, is that it uses the Teensy microcontroller to do the sensors.

3. State and introduce at least one research question that, when answered, will fill the knowledge gap.

* Once I understand how to write in *bra-ket* notation, I will understand much more about the articles in quantum computing that I am reading.
* Once I do more work with micro controllers and spend more time in development, I will better understand how systems with arrays of sensors are implemented.

4. Broadly, describe the steps that you will take to answer the research question(s), and fill the knowledge gap.

* I will first start by meeting with my professors to understand more about where I could fill this gap
* I will spend more time in my textbook to understand more how to fill this gap
* I will hopefully start summer research in nanophysics to learn more about which areas of this gap I would like to fill
* I will do small projects with my own micro controller over the summer
