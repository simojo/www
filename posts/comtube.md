# comtube
## Python module that Converts YouTube videos into comic books
### 2020-11-24

Being a frequent user of YouTube, I created a program to turn YouTube videos into a comic books for my CMPSC 100 course project. It's implemented in python and uses a couple of libraries to get things such as the video title, closed captioning, and to work with images and videos. In order to make the generated comic books look natural, the width of images is randomly assigned, to give each frame a dynamic, artistic feeling that one would witness in a real comic book. The height of each image, however, is the same. That said, by changing a single value, you could have as many as $n$ number of comic strips per page; I just found three rows to be the optimal number.

The closed captioning processing is *comically* weak (pun intended), but it still grabs contextual tidbits of sentences and hacks it into a sentence using language tokenization. I also tried to implement my own posterizing algorithm, but it produces an overly green/yellow/brown/red image each time; still posterized, but not properly. Given that the posterization algorithm was implemented as an afterthought, I'm not too concerned. I got the project done in roughly 30 days. Now that I've done some other extracurricular work with image processing, however, if I were faced with the prospect another time, I would most certainly do it the right way.

<img src="https://raw.githubusercontent.com/simojo/comtube/master/demos/comic1/0.png" title="Title page automatically generated from running the program. The YouTube video ID is used as the title." style="width: 100%;" />


<img src="https://raw.githubusercontent.com/simojo/comtube/master/demos/comic1/1.png" title="First page of comic book." style="width: 100%;" />

`comtube`'s demonstration and source code can be found [here](https://github.com/simojo/comtube).
