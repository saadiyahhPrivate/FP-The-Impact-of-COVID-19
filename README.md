# FP-The-Impact-of-COVID-19

This project was developed as the Final Project for the Sping 2020 offering of Interactive Data Visualization (6.894).

## The Development Process ##
At first, we each gathered potential datasets that we would like to explore. After discussing our different datasets and how we envisioned them tying together, we each picked some visualizations that we would like to work on. After doing assignment A4, we thought it would be best for each of us to work on the visualizations separately, and then combine them after they were done. This includes the data wrangling process. Specifically, Alex worked on the “Traffic Collisions in LA County” and “State School Closures” visualizations, Dain worked on the “World Mobility” and “Restaurant traffic” visualizations, and Saadiyah worked on the “World School Closures” and “Flight Volume Data” visualizations.

After the visualizations were done, Alex mainly worked on the Project Page and Readme File, Dain mainly worked on combining the visualizations and styling the page to be cohesive, and Saadiyah mainly worked on styling the final page, the Paper and Video Demonstration.

We met multiple times a week to give updates on our individual progress, to discuss the direction of the project, and to help each other with any problems we may have run into. We made sure we each had something to work towards at the end of each meeting.

Below, we each give our thoughts on the project process:

### Alex ###
Overall, making the visualizations this time around was a lot more enjoyable and interesting now that I knew how to work with D3 and Javascript. For A4, I had to compromise my vision for the visualization since I was limited by my D3 skills, but this time I feel like I was able to fulfill my vision for my two visualizations. The data wrangling process was a bit more involved than last time; I had to pre-process, filter, and format my data to make it easy to work with. Most of my time was spent working on my two visualizations and their descriptions. After they were completed, I worked on making the Project Page and Readme File, which was pretty straightforward. Dain and Saadiyah were amazing partners-- they helped me when I needed to debug, explained how GitHub worked and helped me solve many merge conflicts, and were super dedicated to the project. Overall, this project was a great experience!

### Saadiyah ###
This time around, the most time consuming processes were finding accurate and up to date datasets for the areas we wanted to explore and wrangling the data. Writing re-runnable wrangling scripts in pandas came in handy while streamlining the process as formatting tweaks were often needed. Because we used D3 for A4, I wanted to build on that knowledge as well as exploring a few other visualization packages out there. I found D3-plus and implemented the visualizations I was responsible for using the package. I then used plain JavaScript to implement a timer; we did not have a time dimension in our A4 and getting to dabble in this was very interesting! Once the visualizations were done, I worked on writing little blobs so they fit in our narrative, wrote the final deliverable paper and edited our videos. Dain and Alex were very motivated and skilled team members and helped make this project truly enjoyable to work on.

### Dain ###
Working on this project has been a really exciting process for me. The open-ended nature of our topic allowed us to explore and choose from a wide range of datasets, and because we had several visualizations to work with, we were able to spend some time addressing the more high-level/contextual questions such as what type of visualization best showcases each dataset, how they complement the rest of the visualizations, what interactive features would make the most sense with the data, and how the visualizations should be ordered to create the most compelling narrative. Consolidating the visualizations into a single page presented some unexpected challenges, as all of us had been working on separate scripts and declaring commonly-named global variables without abandon. It definitely taught me a few things about the functionality of JavaScript that I was not aware of. Even though the project had to be done completely remotely, Saadiyah and Alex were incredibly communicative and flexible teammates who made the process enjoyable and as painless as possible.


## Running the server locally ##
To run the server, navigate into the base directory and run:
 `python3 -m http.server [PORT_NUMBER]`
