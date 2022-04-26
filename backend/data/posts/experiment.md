# Experiment
## Results of my experiment
### 2022-04-26

The experiment that I started was for the purpose of testing what the O(n) was for my prototype. I expected this to be linear, but was curious what the output would be if I varied the amount of wave summations I was including into a resultant wave that I was analyzing using the Discrete Fourier Transform (DFT). I used a program called `hyperfine` to make the measurements of time it took to run this prototype, because `hyperfine` works by doing mutlithreaded measurements of the same command.

I found that my results were linear, as I expected them to be. The resulting `O(n)` of my system thus, is
<img src="https://render.githubusercontent.com/render/math?math=O(n)\approx \frac{1}{3}n" />
which I conjectured from my graph by counting the slope visually. This means that I could try to innovate ways to make this prototype's `O(n)` more static as `n` varies. That said, it is not necessary that I complete this step of the process.
