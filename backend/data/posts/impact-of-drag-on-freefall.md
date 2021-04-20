# Impact of Drag on Freefall
## Physics modeling that utilizes nim/rust to preform computations
### 4 12 2020

As a capstone project for PHYS 110, we wrote about and modeled the impact of drag on the freefall of an object by showing the levels of Kinetic Energy, Potential Energy, Speed, and the Work of Drag on the object as it was falling. I saw this as a great opportunity to learn Nim, as it is type safe and would run much faster than python while still being as syntactically sweet as python.

I set up Nim modules for each situation (going up/down, with/without drag) which essentially had functions to map a domain over different models (as a function of vertical displacement) that would yield the Kinetic Energy, Potential Energy, Speed, and the Work of Drag. These were connected with a main module to gather the results and pump them all into csv files for each situation and each metric. I found this implementation to be a bit messy, but it was the quickest thing to do at the time. This allowed me to reproduce my calculations rather than having a mess of papers and hand-drawn graphs.

For the figures, I wasn't able to get Nim's graphing library to work on my local, so I just used python. It parsed the csv files' titles to label axes, ranges, and the title on the graph. I used matplotlib. Looking back, I should have used Julia.

Overall this experience gave me a little glimpse into what computational physics will be like, and I look forward to what other fun little projects I can apply Nim in the future.
