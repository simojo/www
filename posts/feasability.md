# Feasability
## assignment05 - Feasability
### 2022-03-31

1. Hardware: What hardware equipment is necessary to run this project? Include computer specifications or access to a cloud service.

To run my project, it is required that you have some kind of microcontroller device(s), some type of screen panel, and some type of system of lenses that can help the user to focus into this virtual reality headset. While some of these may be expensive, the research here is to demonstrate that it is possible to set up a system that can be viewed by a viewer with their eyes relaxed.

2. Tools: What software, libraries, and similar do you need to complete your project? Provide at least three examples of resources (software tools, programming languages, libraries, etc.) you will use to complete your project.

For the libraries I was thinking of the raspberry pi pico standard library, the teensy microcontroller development board standard library, and the embedded rust crate. The combination of these should allow me to be able to create a robust graphical system that can show a virtual reality through two LCD or OLED panes. I am not completely aware if this will involve an adaptive system that adjusts the distances of lenses for a person's eye or not. I do know, however, that this is going to involve small embedded technology that will transmit an image to a user's eye.

3. Skills: How do the skills that you possess contribute to the completion of your proposed project? Discuss your knowledge of programming languages you might use, familiarity with libraries, ability to install software, your proven record of learning new technical skills, etc.

My knowledge of embedded systems programming will help me in developing this headset. Additionally, my familiarity with optics and the workings of the eye will help me to design a system that can best transmit an image into the eye of a user with their eye relaxed, not focusing on an image up close to them. The idea would be to ensure that the user does not suffer from progressive myopia, an eye condition that results from prolonged focus on objects that are too close to us.

4. Data: Does your project require the use of existing data? If so, what data will you need, where will you obtain this data, how much can you obtain, how much is sufficient to use in your proposed project? If you plan to generate data, discuss how you will do so, where you will store the data, and how you will ensure its security.

My project will require general data about the average person's head size and eye dimensions.

5. Time: How long do you anticipate for this project to take? How long will each part of the project take to complete? Remember that you will only have 2-3 months for the implementation of your project.

This project should take 3 months if I work on it diligently. If I were to strip out unnecessary parts of this project, this project could take 2 months if I were to work on it diligently.

6. Results: What do successful results look like? How will you test your project for both correctness and efficiency?

Successful results will be an image exiting from these oculars that come out with parallel beams of light. Additionally, this will adjust for different people's eye size, so that people with near or farsightedness will not struggle when gazing into this virtual reality headset.

7. Analysis: How will you analyze the results? What approach will you use in the analysis? What experiments will you run to demonstrate your project and obtain results for analysis?

The results could be from testing people with different eye shapes and also by analyzing the pattern of the image coming out of the eyepieces. I could transmit simple high-contrast images from these eyepieces that I can hold up to a screen to ensure that minimal magnification is happening coming out of these eyepieces. This would translate to the user not having to strain their eyes when they look into these eyepieces.

8. Other abilities and resources: What else do you need for this project? Is there anything else that you may need to use or implement at some point to make this project successful? What is your back-up plan if your original project process fails?

I would have to buy a small amount of lenses and research to ensure that I am purchasing the correct lenses for this job. I will also have to invest in good micro controllers that can be used on a breadboard and then detached to be implemented in a real-time system with a small form factor (RP2040/ATMEGA processors). If this fails, I will have to possibly shift gears into developing a system with screens at a static distance from the person's eye.

9. Threats to Validity: What might invalidate your reported results? For example, are there any assumptions you made in your experimental design, is the data set you plan to use large enough, are you relying on someone else's work that may contain mistakes, is your research process reproducible?

My reported results might be invalidated if I were to not be able to miniaturize this system to fit on the head of someone. In this case, I would have to use an Oculus system and send data to it from a computer that is separate. Using the Oculus would limit my abilities in hardware; however, it would permit me to have freedom in development without having to create my own imaging system for a person's head.

10. Please provide a cohesive blog post for feasibility on your website (min 200 words) to summarize your answers for the above questions.
