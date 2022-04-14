# Protoype
## assignment06 - prototype
### 2022-04-14

For this assignment, I created a prototype of a tool that will aid me in my senior comprehensive project. I decided to create a program to calculate the discrete Fourier transform of a set of points. The original motivation for this came from what is done in the field of *diffractive optics*, where light is passed through some matter and then measured from its original path. The resulting disturbances calculated can be mapped to a function that is then used to calculate the Fourier transform.

The Fourier transform allows the function, either periodic or aperiodic, to be put in terms of periodic functions, namely, sines and cosines. My implementation used the discrete Fourier transform because I was not operating on a continuous set of numbers. To calculate the sums of the even and odd coefficients of the transform, I recursively composed a function for each, maintaining a parameter **k**, which is the spatial or angular frequency. I then took the magnitude of the two coefficients to map it from imaginary space to real space. This provided me with amplitudes of a wave with a given frequency, X(k). These calculations were done in the Julia language, a language popular among the scientific community.

For plotting the transform, I used **Plotly.JS**. Plotly provides APIs for interactive graphs, and I figured it would be the best for graphing my discrete calculations to look continuous. This will also aid in the presentation aspect.
