# Finding the energies of a particle in a 3d box combinatorially
## Here I show that we can use a generating function to solve for the energy states for the classic quantum mechanics problem of a particle in a 3d box.
### 2022-11-02

While working on a problem in one of my classes *(Griffiths, Quantum Mechanics, 3rd Ed. p4.2)*, I realized that the solution was a direct application of a part of combinatorics: generating functions. The problem goes as follows:

#### Use separation of variables in cartesian coordinates to solve the inifinite *cubical* well (or "particle in a box"):

$$
V(x,y,z)=
\left\\{
\begin{array}{cl}
0, & x,y,z\ \text{all between 0 and}\ a\text{;} \\
\infty, & \text{otherwise.}
\end{array}\right\\}
$$

### Getting an expression

Skip this part if you just want to see the cool ending. Otherwise, stick around for a short derivation.

We know our hamiltonian will look like this,

$$
\mathcal{H}=-\frac{\hbar^2}{2m}\left(\frac{\partial^2}{\partial x^2}+\frac{\partial^2}{\partial y^2}+\frac{\partial^2}{\partial z^2} \right)+V(x,y,z).
$$

So, in order to find the energies, we'll look for a function $\psi(x,y,z)=X(x)Y(y)Z(z)$, as a product of the wave function for each dimenson. Observe,
$$
E\psi=\mathcal{H}\psi
$$
$$
EXYZ=-\frac{\hbar^2}{2m}\left(X''+Y''+Z''\right)
$$
$$
E=-\frac{\hbar^2}{2m}\left(\frac{X''}{X}+\frac{Y''}{Y}+\frac{Z''}{Z}\right)
$$

Now we just need to solve the differential equation $f''=fX \xrightarrow \frac{f''}{f}=A$.

This yields three independent solutions, $\psi_x, \psi_y,\ \text{and}\  \psi_z$, which happen to be 

### Applying the combinatorics

Alright, here is where the 

$$f(x)=\sum_{i=1}^\infty x^{i^2}+\sum_{i=1}^\infty x^{i^2} + \sum_{i=1}^\infty x^{i^2}$$
