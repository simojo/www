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
EXYZ=-\frac{\hbar^2}{2m}\left(X''YZ+Y''XZ+Z''XY\right)
$$
$$
E=-\frac{\hbar^2}{2m}\left(\frac{X''}{X}+\frac{Y''}{Y}+\frac{Z''}{Z}\right)
$$

Now we just need to solve the differential equation $f''=AF \Rightarrow \frac{f''}{f}=A$ with the boundary conditions $f(0)=f(a)=0$.

This yields the three independent solutions,
$$
\begin{array}{lr}
X(x)=\frac{2}{a}\sin\left(\frac{n_x \pi x}{a}\right) & (n_x \in \mathbb{Z}^+) \\
Y(x)=\frac{2}{a}\sin\left(\frac{n_y \pi y}{a}\right) & (n_y \in \mathbb{Z}^+) \\
Z(x)=\frac{2}{a}\sin\left(\frac{n_z \pi z}{a}\right) & (n_z \in \mathbb{Z}^+). \\
\end{array}
$$

Now we know $\psi=\left(\frac{2}{a}\right)^{\frac{3}{2}}\sin\left(\frac{n_x \pi x}{a}\right)\sin\left(\frac{n_y \pi y}{a}\right)\sin\left(\frac{n_z \pi z}{a}\right)$. If we put this back into our hamiltonian, we will have our allowed energies:

$$
E=\frac{\pi^2\hbar^2}{2ma^2}\left(n_x^2+n_y^2+_z^2\right)\ \ (n_x,n_y,n_z\in \mathbb{Z}^+).
$$

Now, how do we find all possible combinations of integers for these energies in ascending order? It would take a considerable amount of trial and error to even get the first 10 distinct energies in order. Luckily, there's a tool in mathematics that can get us there.

### Applying the combinatorics

Alright, here is where we apply our clever trick. The allowed energies for the given conditions are
$$
E=\frac{\pi^2\hbar^2}{2ma^2}\left(n_x^2+n_y^2+_z^2\right)\ \ (n_x,n_y,n_z\in \mathbb{Z}^+).
$$
Rather than plugging in different combinations for each integer $n_x,n_y,n_z$, mathematics gives us a tool called *generating functions* that help us out.

$$f(x)=\sum_{i=1}^\infty x^{i^2}+\sum_{i=1}^\infty x^{i^2} + \sum_{i=1}^\infty x^{i^2}$$
