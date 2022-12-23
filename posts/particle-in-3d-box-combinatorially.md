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

We know our Hamiltonian will look like this,

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

Now we just need to solve the differential equation $f''=Af \Rightarrow \frac{f''}{f}=A$ with the boundary conditions $f(0)=f(a)=0$.

This yields the three independent solutions,

$$
X(x)=\frac{2}{a}\sin\left(\frac{n_x \pi x}{a}\right),\ \ (n_x \in \mathbb{Z}^+),
$$
$$
Y(x)=\frac{2}{a}\sin\left(\frac{n_y \pi y}{a}\right),\ \ (n_y \in \mathbb{Z}^+),
$$
$$
Z(x)=\frac{2}{a}\sin\left(\frac{n_z \pi z}{a}\right),\ \ (n_z \in \mathbb{Z}^+).
$$

Now we know $\psi=\left(\frac{2}{a}\right)^{\frac{3}{2}}\sin\left(\frac{n_x \pi x}{a}\right)\sin\left(\frac{n_y \pi y}{a}\right)\sin\left(\frac{n_z \pi z}{a}\right)$. If we put this back into our Hamiltonian, we will have our allowed energies:

$$
E=\frac{\pi^2\hbar^2}{2ma^2}\left(n_x^2+n_y^2+n_z^2\right)\ \ (n_x,n_y,n_z\in \mathbb{Z}^+).
$$

Or, with $E_0=\frac{\pi^2\hbar^2}{2ma^2}$,

$$
E=E_0\left(n_x^2+n_y^2+n_z^2\right)\ \ (n_x,n_y,n_z\in \mathbb{Z}^+).
$$

Now, how do we find all possible combinations of integers for these energies in ascending order? It would take a considerable amount of trial and error to even get the first 10 distinct energies in order. Luckily, there's a tool in mathematics that can get us there.

### Applying the combinatorics

Alright, here is where we apply our clever trick. The allowed energies for the given conditions are

$$
E=E_0\left(n_x^2+n_y^2+n_z^2\right)\ \ (n_x,n_y,n_z\in \mathbb{Z}^+).
$$

Rather than plugging in different combinations for each integer $n_x,n_y,n_z$, mathematics gives us a tool called a *generating function* that helps us out. Generating functions are special functions that we create so that the coefficients of each term tells us something, whether it be a finding a recurrence relation, finding combinations of integers, or getting binomial expansions.

In our case, we have three integer *choices*, if you will. Each choice can range from $1$ to $\infty$, just like the quantum number for a particle in a 1 dimensional box. Consider the following generating function,

$$
f(x)=(x^0+x^1+x^2+x^3+\dots)(x^0+x^1+x^2+x^3+\dots)
$$

Expanding this will result in some infinite sequence $a_1\cdot x^{n_1}+a_2\cdot x^{n_2}+a_3\cdot x^{n_3}\dots$. What if we try to look at one term in the expansion of $f$? Let's pick the term with $x^{10}$. We know it exists, but what would its coefficient be? In other words, we're asking, "How many ways are there to get $x^10$ by multiplying out these two polynomials?" Further, "How many ways can we add up to $10$ by picking any two numbers less than or equal to $10$?" Now we have boiled down a question of combining a function into a question of combinations of numbers. After expanding this polynomial out, we see that

$$
f(x)=1+2x+3x^2+4x^3+5x^4+6x^5+7x^6+8x^7+9x^8+10x^9+11x^{10}+\dots.
$$

Now we know that there are 11 ways to get $x^{10}$ (hence, a coefficient of $11$) in our expression. Thus, there are $11$ ways to add up to ten from picking two numbers less than or equal to $10$.

This is great, but we're not counting by $0,1,2,3,\dots$ in our problem. We're counting instead by $1^2,2^2,3^3,\dots$. Easy. We change the exponents of the numbers to be the squares of the integers, and we cube the entire expression, because we're choosing three integers:

$$
f(x)=(x^1^2+x^2^2+x^3^2\dots)^3=\left(\sum_{i=1}^\infty x^{i^2}\right)^3
$$

Unfortunately, we can really only expand this computationally. Expanding this using my calculator, I find that

$$
f(x)=x^3+3x^6+3x^9+3x^{11}+x^{12}+6x^{14}+\dots.
$$

Each exponent is what our three choices sum to, while the coefficient in front is the degeneracy of that choice (number of repeats). This means that with the expression $N=(n_x^2+n_y^2+n_z^2)$, there is one way to make $N=3$, three ways to make $N=6$, three ways to make $N=9$, six ways to make $N=14$, and so on. So we can make a neat table describing the possible energies for $E$.

$$
\begin{array}{c|c}
E & \text{Degeneracy} \\
\hline
3E_0 & 1 \\
6E_0 & 3 \\
9E_0 & 3 \\
11E_0 & 3 \\
12E_0 & 1 \\
14E_0 & 6
\end{array}
$$

### Conclusion

Generating functions are a powerful tool in mathematics that can save a considerable amount of time if you use them correctly. Of course, no practical problems in quantum mechanics come as clean as the one discussed here, but similar computations come up, especially when trying to calculate degeneracies of energetic states.


Open a pull request or contact me if you think any of this could be made clearer, or if you have any other interesting ideas I should share!
